import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  User, 
  GraduationCap, 
  Globe, 
  DollarSign, 
  MapPin, 
  Briefcase, 
  Languages,
  CheckCircle,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  FileText,
  Trophy,
  Target,
  Clock
} from 'lucide-react';

// Compulsory fields for profile completion
const COMPULSORY_FIELDS = [
  'firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'phoneNumber',
  'highestQualification', 'highestInstitution', 'highestGpa', 'graduationYear',
  'interestedCourse', 'fieldOfStudy', 'preferredIntake', 'budgetRange',
  'preferredCountries', 'currentEmploymentStatus', 'englishProficiencyTests'
];

const PROFILE_SECTIONS = [
  { 
    id: 'personal', 
    label: 'Personal Information', 
    icon: User, 
    description: 'Basic details for accurate analysis',
    fields: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'passportNumber', 'phoneNumber', 'secondaryNumber', 'address']
  },
  { 
    id: 'academic', 
    label: 'Academic Qualification', 
    icon: GraduationCap, 
    description: 'Education history for program matching',
    fields: ['highestQualification', 'highestInstitution', 'highestCountry', 'highestGpa', 'graduationYear', 'currentAcademicGap']
  },
  { 
    id: 'study', 
    label: 'Study Preferences', 
    icon: Globe, 
    description: 'Course and country preferences',
    fields: ['interestedCourse', 'fieldOfStudy', 'preferredIntake', 'partTimeInterest', 'accommodationRequired', 'hasDependents']
  },
  { 
    id: 'budget', 
    label: 'Budget Range', 
    icon: DollarSign, 
    description: 'Financial planning for accurate recommendations',
    fields: ['budgetRange']
  },
  { 
    id: 'countries', 
    label: 'Preferred Countries', 
    icon: MapPin, 
    description: 'Target destinations for personalized analysis',
    fields: ['preferredCountries']
  },
  { 
    id: 'employment', 
    label: 'Employment Status', 
    icon: Briefcase, 
    description: 'Work experience for visa applications',
    fields: ['currentEmploymentStatus', 'workExperienceYears', 'jobTitle', 'organizationName', 'fieldOfWork']
  },
  { 
    id: 'tests', 
    label: 'Tests & English Proficiency', 
    icon: Languages, 
    description: 'Language scores for admission requirements',
    fields: ['englishProficiencyTests', 'standardizedTests']
  }
];

export default function EnhancedUserProfile() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  }) as { data: any };

  // Calculate completion based on actual user data
  const calculateCompletion = useMemo(() => {
    if (!user) return { percentage: 0, completedFields: 0, totalFields: COMPULSORY_FIELDS.length };
    
    const completedFields = COMPULSORY_FIELDS.filter(field => {
      const value = user[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
    
    const percentage = Math.round((completedFields.length / COMPULSORY_FIELDS.length) * 100);
    
    return {
      percentage,
      completedFields: completedFields.length,
      totalFields: COMPULSORY_FIELDS.length
    };
  }, [user]);

  const getSectionStatus = (sectionId: string) => {
    if (!user) return { completed: false, progress: 0, completedCount: 0, totalCount: 0 };
    
    const section = PROFILE_SECTIONS.find(s => s.id === sectionId);
    if (!section) return { completed: false, progress: 0, completedCount: 0, totalCount: 0 };
    
    const completedSectionFields = section.fields.filter(field => {
      const value = user[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
    
    const progress = Math.round((completedSectionFields.length / section.fields.length) * 100);
    const completed = progress === 100;
    
    return { 
      completed, 
      progress, 
      completedCount: completedSectionFields.length, 
      totalCount: section.fields.length 
    };
  };

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user/complete-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile-completion'] });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                    calculateCompletion.percentage >= 80 ? 'bg-green-500' : 
                    calculateCompletion.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    <span className="text-xs font-bold text-white">{calculateCompletion.percentage}</span>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
                <p className="text-blue-100 text-lg">{user.email}</p>
                <div className="flex flex-wrap items-center mt-2 gap-3">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {user.role === 'admin' ? 'Administrator' : 'Student'}
                  </Badge>
                  <span className="text-blue-100 text-sm">
                    {user.analysisCount || 0}/{user.maxAnalyses || 3} analyses used
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:text-right">
              <div className="text-sm text-blue-100 mb-2">Profile Completion</div>
              <div className="w-full lg:w-32">
                <Progress value={calculateCompletion.percentage} className="bg-white/20" />
              </div>
              <div className="text-sm text-blue-100 mt-1">
                {calculateCompletion.completedFields}/{calculateCompletion.totalFields} fields completed ({calculateCompletion.percentage}%)
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Alert */}
        {calculateCompletion.percentage < 80 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    Complete your profile to unlock AI-powered features
                  </p>
                  <p className="text-sm text-yellow-700">
                    Complete {calculateCompletion.totalFields - calculateCompletion.completedFields} more required fields to reach the 80% threshold for AI analysis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {PROFILE_SECTIONS.map((section) => {
            const status = getSectionStatus(section.id);
            const Icon = section.icon;
            
            return (
              <Card 
                key={section.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  status.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
                onClick={() => setActiveTab(section.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${status.completed ? 'text-green-600' : 'text-gray-500'}`} />
                      <span className={`font-medium ${status.completed ? 'text-green-900' : 'text-gray-900'}`}>
                        {section.label}
                      </span>
                    </div>
                    {status.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className={status.completed ? 'text-green-600' : 'text-gray-600'}>
                        {Math.round(status.progress)}%
                      </span>
                    </div>
                    <Progress value={status.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Profile Details Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="study">Study Preferences</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="countries">Countries</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    {user.email}
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    {user.phoneNumber || 'Not provided'}
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {user.nationality || 'Not provided'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                    Academic Background
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Qualification:</span>
                    <p className="text-gray-600">{user.highestQualification || 'Not provided'}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Institution:</span>
                    <p className="text-gray-600">{user.highestInstitution || 'Not provided'}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">GPA:</span>
                    <p className="text-gray-600">{user.highestGpa || 'Not provided'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-600" />
                    Study Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Interested Course:</span>
                    <p className="text-gray-600">{user.interestedCourse || 'Not provided'}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Field of Study:</span>
                    <p className="text-gray-600">{user.fieldOfStudy || 'Not provided'}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Budget Range:</span>
                    <p className="text-gray-600">{user.budgetRange || 'Not provided'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details for accurate document analysis and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={user.firstName || ''} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={user.lastName || ''} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input 
                      id="dateOfBirth" 
                      type="date" 
                      value={user.dateOfBirth || ''} 
                      onChange={(e) => updateMutation.mutate({ dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={user.gender || ''} 
                      onValueChange={(value) => updateMutation.mutate({ gender: value })}
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
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input 
                      id="nationality" 
                      value={user.nationality || ''} 
                      onChange={(e) => updateMutation.mutate({ nationality: e.target.value })}
                      placeholder="e.g., Indian, Nepali, Pakistani"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Passport Number</Label>
                    <Input 
                      id="passportNumber" 
                      value={user.passportNumber || ''} 
                      onChange={(e) => updateMutation.mutate({ passportNumber: e.target.value })}
                      placeholder="Enter passport number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address" 
                    value={user.address || ''} 
                    onChange={(e) => updateMutation.mutate({ address: e.target.value })}
                    placeholder="Enter your complete address"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Qualification Tab */}
          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Qualification</CardTitle>
                <CardDescription>
                  Provide your educational background for accurate program matching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="highestQualification">Highest Qualification</Label>
                    <Select 
                      value={user.highestQualification || ''} 
                      onValueChange={(value) => updateMutation.mutate({ highestQualification: value })}
                    >
                      <SelectTrigger>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highestInstitution">Institution Name</Label>
                    <Input 
                      id="highestInstitution" 
                      value={user.highestInstitution || ''} 
                      onChange={(e) => updateMutation.mutate({ highestInstitution: e.target.value })}
                      placeholder="Enter institution name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highestCountry">Country of Education</Label>
                    <Input 
                      id="highestCountry" 
                      value={user.highestCountry || ''} 
                      onChange={(e) => updateMutation.mutate({ highestCountry: e.target.value })}
                      placeholder="Enter country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highestGpa">GPA/Grade</Label>
                    <Input 
                      id="highestGpa" 
                      value={user.highestGpa || ''} 
                      onChange={(e) => updateMutation.mutate({ highestGpa: e.target.value })}
                      placeholder="e.g., 3.8, 85%, First Class"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input 
                      id="graduationYear" 
                      type="number" 
                      value={user.graduationYear || ''} 
                      onChange={(e) => updateMutation.mutate({ graduationYear: parseInt(e.target.value) })}
                      placeholder="e.g., 2023"
                      min="1980"
                      max="2030"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would follow similar patterns... */}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}