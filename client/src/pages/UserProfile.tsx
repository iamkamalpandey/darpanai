// Enhanced User Profile Management with CRM functionality
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { User, Phone, Mail, MapPin, Calendar, GraduationCap, Globe, DollarSign, Briefcase, Star, Clock, Target, Tag, Save, Edit3, Plus, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Profile validation schema based on CRM requirements
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().regex(/^[\+]?[\d\s\-\(\)]{7,15}$/, 'Invalid phone number format').optional(),
  alternatePhone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  nationality: z.string().optional(),
  
  // Academic Information
  currentEducationLevel: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  slcInstitutionName: z.string().optional(),
  slcGrade: z.string().optional(),
  slcYear: z.number().optional(),
  highschoolInstitutionName: z.string().optional(),
  highschoolGrade: z.string().optional(),
  highschoolYear: z.number().optional(),
  bachelorsInstitutionName: z.string().optional(),
  bachelorsGrade: z.string().optional(),
  bachelorsYear: z.number().optional(),
  
  // Study Abroad Preferences
  interestedCourse: z.string().optional(),
  studyLevel: z.string().optional(),
  budgetRange: z.string().optional(),
  intakePreference: z.string().optional(),
  
  // Test Scores
  ieltsOverallScore: z.string().optional(),
  pteOverallScore: z.string().optional(),
  toeflOverallScore: z.string().optional(),
  
  // Work Experience
  workExperienceYears: z.number().optional(),
  currentJobTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  employmentStatus: z.string().optional(),
  
  // Financial Information
  financialCapacity: z.string().optional(),
  
  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserActivity {
  id: number;
  activityType: string;
  activityDescription: string;
  activityDate: string;
  duration?: number;
  outcome?: string;
}

interface UserNote {
  id: number;
  noteType: string;
  noteTitle?: string;
  noteContent: string;
  priority: string;
  isInternal: boolean;
  createdAt: string;
}

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile with error handling
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['/api/user-profile/profile'],
    queryFn: async () => {
      const response = await fetch('/api/user-profile/profile');
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Profile doesn't exist yet
        }
        // Return minimal profile structure for Application Journey to work
        return { 
          firstName: '', 
          lastName: '', 
          currentEducationLevel: '',
          fieldOfStudy: '',
          completionPercentage: 0
        };
      }
      return response.json();
    },
    retry: false, // Don't retry on error, just show default state
  });

  // Fetch profile completion status with fallback
  const { data: completion } = useQuery({
    queryKey: ['/api/user-profile/profile/completion'],
    queryFn: async () => {
      const response = await fetch('/api/user-profile/profile/completion');
      if (!response.ok) {
        // Return fallback completion data
        return {
          completionPercentage: 25,
          isComplete: false,
          missingFields: ['Academic Info', 'Study Preferences', 'Test Scores'],
          completedSections: 1,
          totalSections: 4
        };
      }
      return response.json();
    },
    retry: false,
  });

  // Fetch user activities
  const { data: activities = [] } = useQuery({
    queryKey: ['/api/user-profile/activities'],
    queryFn: async () => {
      const response = await fetch('/api/user-profile/activities');
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    }
  });

  // Fetch user notes
  const { data: notes = [] } = useQuery({
    queryKey: ['/api/user-profile/notes'],
    queryFn: async () => {
      const response = await fetch('/api/user-profile/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      return response.json();
    }
  });

  // Form setup
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile || {}
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
  }, [profile, form]);

  // Create/Update profile mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const method = profile ? 'PUT' : 'POST';
      const response = await fetch('/api/user-profile/profile', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-profile/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-profile/profile/completion'] });
      setIsEditing(false);
      toast({ title: 'Success', description: 'Profile saved successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (noteData: { noteContent: string; noteType?: string; priority?: string }) => {
      const response = await fetch('/api/user-profile/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add note');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-profile/notes'] });
      toast({ title: 'Success', description: 'Note added successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    profileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and study abroad preferences</p>
          </div>

          {/* Application Progress Dashboard - Always show this */}
          <Card className="mb-6 border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Application Journey
                  </CardTitle>
                  <CardDescription>Track your study abroad application progress and next steps</CardDescription>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Getting Started
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Application Milestones */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Profile Setup</div>
                    <div className="text-xs text-gray-600">Start Here</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Documents</div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Applications</div>
                    <div className="text-xs text-gray-600">Future</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Visa Process</div>
                    <div className="text-xs text-gray-600">Future</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => window.location.href = '/my-documents'}>
                  <FileText className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Upload Documents</div>
                    <div className="text-xs text-gray-600">Add your academic files</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => window.location.href = '/consultations'}>
                  <Calendar className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Book Consultation</div>
                    <div className="text-xs text-gray-600">Expert guidance</div>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => window.location.href = '/scholarship-research'}>
                  <Star className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Find Scholarships</div>
                    <div className="text-xs text-gray-600">Funding opportunities</div>
                  </div>
                </Button>
              </div>

              {/* Getting Started Steps */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Let's Get Started
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Set up your profile with academic and personal information</li>
                  <li>• Upload your academic documents for AI-powered analysis</li>
                  <li>• Book a consultation with our study abroad experts</li>
                  <li>• Explore universities and scholarship opportunities</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Profile setup message */}
          <Alert className="mb-6">
            <AlertDescription>
              Complete your profile setup to unlock personalized recommendations and track your progress. The system is ready to help you with your study abroad journey!
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and study abroad preferences
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsEditing(false)} 
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={profileMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Completion Status */}
      {completion && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Profile Completion</CardTitle>
                <CardDescription>
                  Complete your profile to get better recommendations
                </CardDescription>
              </div>
              <Badge variant={completion.isComplete ? 'default' : 'secondary'}>
                {completion.completionPercentage}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completion.completionPercentage} className="mb-4" />
            
            {completion.missingFields.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Missing sections:
                </p>
                <div className="flex flex-wrap gap-1">
                  {completion.missingFields.map((field: string) => (
                    <Badge key={field} variant="outline" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Application Progress Dashboard - Integrated CRM Feature */}
      <Card className="mb-6 border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Application Journey
              </CardTitle>
              <CardDescription>Track your study abroad application progress and next steps</CardDescription>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              In Progress
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Application Milestones */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">Profile Setup</div>
                <div className="text-xs text-gray-600">{completion?.completionPercentage || 0}% Complete</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">Documents</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">Applications</div>
                <div className="text-xs text-gray-600">Upcoming</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">Visa Process</div>
                <div className="text-xs text-gray-600">Future</div>
              </div>
            </div>
          </div>

          {/* Quick Actions for Application Management */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => window.location.href = '/my-documents'}>
              <FileText className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Upload Documents</div>
                <div className="text-xs text-gray-600">Add your academic files</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => window.location.href = '/consultations'}>
              <Calendar className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Book Consultation</div>
                <div className="text-xs text-gray-600">Expert guidance</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => window.location.href = '/scholarship-research'}>
              <Star className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Find Scholarships</div>
                <div className="text-xs text-gray-600">Funding opportunities</div>
              </div>
            </Button>
          </div>

          {/* Smart Next Steps based on Profile Completion */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              Recommended Next Steps
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {completion?.completionPercentage < 100 && (
                <li>• Complete your profile to unlock personalized recommendations</li>
              )}
              <li>• Upload your academic documents for AI-powered analysis</li>
              <li>• Research universities and programs matching your profile</li>
              <li>• Book a consultation with our study abroad experts</li>
              <li>• Explore scholarship opportunities and funding options</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...form.register('firstName')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...form.register('lastName')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      {...form.register('phoneNumber')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alternatePhone">Alternate Phone</Label>
                    <Input
                      id="alternatePhone"
                      {...form.register('alternatePhone')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...form.register('dateOfBirth')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      disabled={!isEditing}
                      value={form.watch('gender') || ''}
                      onValueChange={(value) => form.setValue('gender', value as any)}
                    >
                      <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    {...form.register('address')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...form.register('city')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      {...form.register('state')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      {...form.register('country')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      {...form.register('nationality')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Information Tab */}
        <TabsContent value="academic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Educational Background
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentEducationLevel">Current Education Level</Label>
                  <Select
                    disabled={!isEditing}
                    value={form.watch('currentEducationLevel') || ''}
                    onValueChange={(value) => form.setValue('currentEducationLevel', value)}
                  >
                    <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_school">High School</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input
                    id="fieldOfStudy"
                    {...form.register('fieldOfStudy')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="e.g., Computer Science, Business Administration"
                  />
                </div>

                <Separator />

                {/* High School Information */}
                <div className="space-y-3">
                  <h4 className="font-medium">High School / SLC</h4>
                  <div>
                    <Label htmlFor="slcInstitutionName">Institution Name</Label>
                    <Input
                      id="slcInstitutionName"
                      {...form.register('slcInstitutionName')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slcGrade">Grade/GPA</Label>
                      <Input
                        id="slcGrade"
                        {...form.register('slcGrade')}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="slcYear">Graduation Year</Label>
                      <Input
                        id="slcYear"
                        type="number"
                        {...form.register('slcYear', { valueAsNumber: true })}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Test Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ieltsOverallScore">IELTS Overall Score</Label>
                  <Input
                    id="ieltsOverallScore"
                    {...form.register('ieltsOverallScore')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="e.g., 7.5"
                  />
                </div>

                <div>
                  <Label htmlFor="pteOverallScore">PTE Overall Score</Label>
                  <Input
                    id="pteOverallScore"
                    {...form.register('pteOverallScore')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="e.g., 65"
                  />
                </div>

                <div>
                  <Label htmlFor="toeflOverallScore">TOEFL Overall Score</Label>
                  <Input
                    id="toeflOverallScore"
                    {...form.register('toeflOverallScore')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="e.g., 90"
                  />
                </div>

                <Separator />

                {/* Work Experience */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Work Experience
                  </h4>
                  <div>
                    <Label htmlFor="currentJobTitle">Current Job Title</Label>
                    <Input
                      id="currentJobTitle"
                      {...form.register('currentJobTitle')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentCompany">Current Company</Label>
                    <Input
                      id="currentCompany"
                      {...form.register('currentCompany')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workExperienceYears">Years of Experience</Label>
                    <Input
                      id="workExperienceYears"
                      type="number"
                      {...form.register('workExperienceYears', { valueAsNumber: true })}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Study Preferences Tab */}
        <TabsContent value="preferences">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Study Abroad Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="interestedCourse">Interested Course</Label>
                  <Input
                    id="interestedCourse"
                    {...form.register('interestedCourse')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="e.g., Master's in Computer Science"
                  />
                </div>

                <div>
                  <Label htmlFor="studyLevel">Study Level</Label>
                  <Select
                    disabled={!isEditing}
                    value={form.watch('studyLevel') || ''}
                    onValueChange={(value) => form.setValue('studyLevel', value)}
                  >
                    <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                      <SelectValue placeholder="Select study level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bachelor">Bachelor's</SelectItem>
                      <SelectItem value="master">Master's</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="intakePreference">Intake Preference</Label>
                  <Select
                    disabled={!isEditing}
                    value={form.watch('intakePreference') || ''}
                    onValueChange={(value) => form.setValue('intakePreference', value)}
                  >
                    <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                      <SelectValue placeholder="Select intake" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="budgetRange">Budget Range</Label>
                  <Select
                    disabled={!isEditing}
                    value={form.watch('budgetRange') || ''}
                    onValueChange={(value) => form.setValue('budgetRange', value)}
                  >
                    <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_20k">Under $20,000</SelectItem>
                      <SelectItem value="20k_40k">$20,000 - $40,000</SelectItem>
                      <SelectItem value="40k_60k">$40,000 - $60,000</SelectItem>
                      <SelectItem value="60k_80k">$60,000 - $80,000</SelectItem>
                      <SelectItem value="over_80k">Over $80,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="financialCapacity">Financial Capacity</Label>
                  <Textarea
                    id="financialCapacity"
                    {...form.register('financialCapacity')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    rows={3}
                    placeholder="Describe your financial situation and funding sources"
                  />
                </div>

                <Separator />

                {/* Emergency Contact */}
                <div className="space-y-3">
                  <h4 className="font-medium">Emergency Contact</h4>
                  <div>
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      {...form.register('emergencyContactName')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactPhone">Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        {...form.register('emergencyContactPhone')}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                      <Input
                        id="emergencyContactRelationship"
                        {...form.register('emergencyContactRelationship')}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                        placeholder="e.g., Parent, Guardian"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>
                Track your interactions and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No activities recorded yet
                  </p>
                ) : (
                  activities.map((activity: UserActivity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.activityDescription}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.activityType} • {new Date(activity.activityDate).toLocaleDateString()}
                        </p>
                        {activity.outcome && (
                          <p className="text-xs text-gray-600 mt-1">
                            Outcome: {activity.outcome}
                          </p>
                        )}
                      </div>
                      {activity.duration && (
                        <div className="flex-shrink-0">
                          <Badge variant="outline">{activity.duration}min</Badge>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes & Communication
                  </CardTitle>
                  <CardDescription>
                    Add personal notes and view communication history
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    const content = prompt('Enter your note:');
                    if (content) {
                      addNoteMutation.mutate({ noteContent: content, noteType: 'general' });
                    }
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No notes added yet
                  </p>
                ) : (
                  notes.map((note: UserNote) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {note.noteTitle && (
                            <h4 className="font-medium">{note.noteTitle}</h4>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {note.noteType}
                          </Badge>
                          {note.priority !== 'normal' && (
                            <Badge 
                              variant={note.priority === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {note.priority}
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {note.noteContent}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}