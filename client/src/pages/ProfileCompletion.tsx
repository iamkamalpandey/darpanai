import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  User, 
  GraduationCap, 
  MapPin, 
  DollarSign, 
  Globe, 
  Heart, 
  Target,
  CheckCircle,
  AlertCircle,
  Book,
  Calendar,
  Phone
} from 'lucide-react';

// Profile completion schema
const profileCompletionSchema = z.object({
  // Academic Information
  studyLevel: z.string().min(1, "Study level is required"),
  preferredStudyFields: z.array(z.string()).min(1, "At least one study field is required"),
  startDate: z.string().min(1, "Start date is required"),
  
  // Financial Information
  budgetRange: z.string().min(1, "Budget range is required"),
  fundingSource: z.string().min(1, "Funding source is required"),
  
  // Preferences
  studyDestination: z.string().optional(),
  languagePreferences: z.array(z.string()).min(1, "At least one language preference is required"),
  climatePreference: z.string().min(1, "Climate preference is required"),
  
  // Importance Ratings
  universityRankingImportance: z.string().min(1, "University ranking importance is required"),
  workPermitImportance: z.string().min(1, "Work permit importance is required"),
  
  // Cultural & Career
  culturalPreferences: z.array(z.string()),
  careerGoals: z.string().min(10, "Career goals must be at least 10 characters"),
  
  // Additional Information
  counsellingMode: z.string().min(1, "Counselling mode is required"),
});

type ProfileCompletionData = z.infer<typeof profileCompletionSchema>;

interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  completedSections: string[];
}

const studyLevels = [
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "phd", label: "PhD/Doctorate" },
  { value: "diploma", label: "Diploma" },
  { value: "certificate", label: "Certificate" },
];

const studyFields = [
  "Engineering", "Computer Science", "Business", "Medicine", "Law", "Arts", "Sciences",
  "Mathematics", "Economics", "Psychology", "Education", "Architecture", "Design",
  "Agriculture", "Environmental Studies", "Social Work", "Communications", "Languages"
];

const budgetRanges = [
  { value: "low", label: "Low ($10,000 - $25,000/year)" },
  { value: "medium", label: "Medium ($25,000 - $50,000/year)" },
  { value: "high", label: "High ($50,000+/year)" },
];

const fundingSources = [
  { value: "self-funded", label: "Self-funded" },
  { value: "family", label: "Family funded" },
  { value: "scholarship", label: "Scholarship" },
  { value: "loan", label: "Education loan" },
  { value: "employer", label: "Employer sponsored" },
  { value: "mixed", label: "Multiple sources" },
];

const languages = [
  "English", "Spanish", "French", "German", "Mandarin", "Japanese", "Korean",
  "Arabic", "Portuguese", "Italian", "Dutch", "Russian", "Hindi"
];

const climatePreferences = [
  { value: "tropical", label: "Tropical (warm and humid)" },
  { value: "temperate", label: "Temperate (moderate seasons)" },
  { value: "cold", label: "Cold (cool to cold weather)" },
  { value: "arid", label: "Arid (dry climate)" },
  { value: "no-preference", label: "No specific preference" },
];

const importanceLevels = [
  { value: "not-important", label: "Not Important" },
  { value: "somewhat", label: "Somewhat Important" },
  { value: "very-important", label: "Very Important" },
];

const culturalFactors = [
  "Multicultural environment", "English-speaking country", "Similar cultural values",
  "Strong international student community", "Religious tolerance", "LGBTQ+ friendly",
  "Safe for women", "Family-friendly", "Urban lifestyle", "Rural lifestyle"
];

const counsellingModes = [
  { value: "online", label: "Online consultation" },
  { value: "in-person", label: "In-person meeting" },
  { value: "phone", label: "Phone consultation" },
  { value: "flexible", label: "Flexible (any mode)" },
];

export default function ProfileCompletion() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("academic");

  // Fetch current user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user'],
  });

  // Fetch profile completion status
  const { data: completionStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/user/profile-completion'],
  });

  const form = useForm<ProfileCompletionData>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      studyLevel: user?.studyLevel || "",
      preferredStudyFields: user?.preferredStudyFields || [],
      startDate: user?.startDate || "",
      budgetRange: user?.budgetRange || "",
      fundingSource: user?.fundingSource || "",
      studyDestination: user?.studyDestination || "",
      languagePreferences: user?.languagePreferences || [],
      climatePreference: user?.climatePreference || "",
      universityRankingImportance: user?.universityRankingImportance || "",
      workPermitImportance: user?.workPermitImportance || "",
      culturalPreferences: user?.culturalPreferences || [],
      careerGoals: user?.careerGoals || "",
      counsellingMode: user?.counsellingMode || "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileCompletionData) =>
      apiRequest('/api/user/complete-profile', {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile-completion'] });
      
      // Redirect back to destination suggestions if profile is complete
      setLocation('/destination-suggestions');
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileCompletionData) => {
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

  const completionPercentage = completionStatus?.completionPercentage || 0;
  const missingFields = completionStatus?.missingFields || [];
  const isComplete = completionStatus?.isComplete || false;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Complete your profile to get personalized study destination recommendations
            </p>
          </div>
          <Badge variant={isComplete ? "default" : "secondary"} className="px-3 py-1">
            {isComplete ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Complete
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 mr-1" />
                {Math.round(completionPercentage)}% Complete
              </>
            )}
          </Badge>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Profile Completion Progress
            </CardTitle>
            <CardDescription>
              {isComplete
                ? "Your profile is complete! You can now access all features."
                : `Complete ${missingFields.length} more fields to unlock AI destination suggestions.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={completionPercentage} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{Math.round(completionPercentage)}% Complete</span>
              <span>{missingFields.length} fields remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Missing Fields Alert */}
        {!isComplete && missingFields.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required fields:</strong> {missingFields.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Please fill out all sections to receive personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="academic">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Academic
                    </TabsTrigger>
                    <TabsTrigger value="financial">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Financial
                    </TabsTrigger>
                    <TabsTrigger value="preferences">
                      <Heart className="w-4 h-4 mr-2" />
                      Preferences
                    </TabsTrigger>
                    <TabsTrigger value="goals">
                      <Target className="w-4 h-4 mr-2" />
                      Goals
                    </TabsTrigger>
                  </TabsList>

                  {/* Academic Information */}
                  <TabsContent value="academic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="studyLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Study Level *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select study level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {studyLevels.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                  </SelectItem>
                                ))}
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
                            <FormLabel>Intended Start Date *</FormLabel>
                            <FormControl>
                              <Input type="month" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="preferredStudyFields"
                      render={() => (
                        <FormItem>
                          <FormLabel>Preferred Study Fields * (Select at least one)</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {studyFields.map((field) => (
                              <FormField
                                key={field}
                                control={form.control}
                                name="preferredStudyFields"
                                render={({ field: formField }) => {
                                  return (
                                    <FormItem
                                      key={field}
                                      className="flex flex-row items-start space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={formField.value?.includes(field)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? formField.onChange([...(formField.value || []), field])
                                              : formField.onChange(
                                                  formField.value?.filter((value) => value !== field)
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {field}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* Financial Information */}
                  <TabsContent value="financial" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="budgetRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget Range *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select budget range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {budgetRanges.map((range) => (
                                  <SelectItem key={range.value} value={range.value}>
                                    {range.label}
                                  </SelectItem>
                                ))}
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
                            <FormLabel>Primary Funding Source *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select funding source" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fundingSources.map((source) => (
                                  <SelectItem key={source.value} value={source.value}>
                                    {source.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Preferences */}
                  <TabsContent value="preferences" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="climatePreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Climate Preference *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select climate preference" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {climatePreferences.map((climate) => (
                                  <SelectItem key={climate.value} value={climate.value}>
                                    {climate.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="counsellingMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Counselling Mode *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select counselling mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {counsellingModes.map((mode) => (
                                  <SelectItem key={mode.value} value={mode.value}>
                                    {mode.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="languagePreferences"
                      render={() => (
                        <FormItem>
                          <FormLabel>Language Preferences * (Select at least one)</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {languages.map((language) => (
                              <FormField
                                key={language}
                                control={form.control}
                                name="languagePreferences"
                                render={({ field: formField }) => {
                                  return (
                                    <FormItem
                                      key={language}
                                      className="flex flex-row items-start space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={formField.value?.includes(language)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? formField.onChange([...(formField.value || []), language])
                                              : formField.onChange(
                                                  formField.value?.filter((value) => value !== language)
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {language}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="universityRankingImportance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>University Ranking Importance *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select importance level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {importanceLevels.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                  </SelectItem>
                                ))}
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
                            <FormLabel>Work Permit Importance *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select importance level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {importanceLevels.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="culturalPreferences"
                      render={() => (
                        <FormItem>
                          <FormLabel>Cultural Preferences (Optional)</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {culturalFactors.map((factor) => (
                              <FormField
                                key={factor}
                                control={form.control}
                                name="culturalPreferences"
                                render={({ field: formField }) => {
                                  return (
                                    <FormItem
                                      key={factor}
                                      className="flex flex-row items-start space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={formField.value?.includes(factor)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? formField.onChange([...(formField.value || []), factor])
                                              : formField.onChange(
                                                  formField.value?.filter((value) => value !== factor)
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {factor}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* Goals & Additional Info */}
                  <TabsContent value="goals" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="careerGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Career Goals *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your career goals and aspirations after completing your studies..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="studyDestination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Study Destination (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter preferred country (leave blank for suggestions)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/destination-suggestions')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Profile'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}