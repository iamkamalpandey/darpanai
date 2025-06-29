import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Clock,
  Edit,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  CreditCard,
  Building
} from 'lucide-react';
import { Link } from 'wouter';
import { ProfileSectionEditor } from '@/components/ProfileSectionEditor';

// Compulsory fields for profile completion
const COMPULSORY_FIELDS = [
  'firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'phoneNumber',
  'highestQualification', 'highestInstitution', 'highestGpa', 'graduationYear',
  'interestedCourse', 'fieldOfStudy', 'preferredIntake', 'budgetRange',
  'preferredCountries', 'currentEmploymentStatus', 'fundingSource', 'estimatedBudget'
];

// Section field mappings
const SECTION_FIELDS = {
  personal: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'phoneNumber', 'passportNumber', 'address'],
  academic: ['highestQualification', 'highestInstitution', 'highestCountry', 'highestGpa', 'graduationYear', 'currentAcademicGap'],
  studyPreferences: ['interestedCourse', 'fieldOfStudy', 'preferredIntake', 'budgetRange', 'preferredCountries'],
  financial: ['fundingSource', 'estimatedBudget', 'savingsAmount', 'loanAmount'],
  employment: ['currentEmploymentStatus', 'workExperienceYears', 'jobTitle', 'organizationName', 'fieldOfWork'],
  language: ['englishProficiencyTests', 'standardizedTests']
};

export default function EnhancedUserProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Helper functions for formatting ranges
  const formatBudgetRange = (value: string) => {
    const ranges = {
      'help-me-plan': 'Help me Plan (Need Guidance)',
      'under-10000': 'Under $10,000',
      '10000-25000': '$10,000 - $25,000',
      '25000-50000': '$25,000 - $50,000',
      '50000-75000': '$50,000 - $75,000',
      '75000-100000': '$75,000 - $100,000',
      '100000-150000': '$100,000 - $150,000',
      'over-150000': 'Over $150,000',
      'prefer-not-to-say': 'Prefer not to say'
    };
    return ranges[value as keyof typeof ranges] || value;
  };

  const formatSavingsRange = (value: string) => {
    const ranges = {
      'no-savings': 'No Current Savings',
      'under-5000': 'Under $5,000',
      '5000-15000': '$5,000 - $15,000',
      '15000-30000': '$15,000 - $30,000',
      '30000-50000': '$30,000 - $50,000',
      '50000-75000': '$50,000 - $75,000',
      '75000-100000': '$75,000 - $100,000',
      'over-100000': 'Over $100,000',
      'prefer-not-to-say': 'Prefer not to say'
    };
    return ranges[value as keyof typeof ranges] || value;
  };
  
  // Use fresh data endpoint with aggressive refresh mechanism
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['/api/user/fresh'],
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false, // No automatic polling
    notifyOnChangeProps: ['data', 'error'], // Only notify on data changes
  }) as { data: any, isLoading: boolean, refetch: any };

  // Force immediate refresh after any profile updates
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Profile updated detected, forcing fresh data retrieval');
      refetch();
    };
    
    window.addEventListener('profile-updated', handleStorageChange);
    return () => window.removeEventListener('profile-updated', handleStorageChange);
  }, [refetch]);

  // Calculate completion percentage based on actual user data
  const completionPercentage = useMemo(() => {
    if (!user) return 0;
    
    const completedFields = COMPULSORY_FIELDS.filter(field => {
      const value = user[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((completedFields.length / COMPULSORY_FIELDS.length) * 100);
  }, [user]);

  // Section completion checker
  const getSectionCompletion = (sectionFields: string[]) => {
    if (!user) return 0;
    const completedFields = sectionFields.filter(field => {
      const value = user[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
    return Math.round((completedFields.length / sectionFields.length) * 100);
  };

  const getCompletionBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
    if (percentage >= 50) return <Badge variant="secondary">Partial</Badge>;
    return <Badge variant="destructive">Incomplete</Badge>;
  };

  if (isLoading) {
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

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Unable to load profile data.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">Profile Completion:</div>
              <Badge variant={completionPercentage >= 80 ? 'default' : completionPercentage >= 50 ? 'secondary' : 'destructive'}>
                {Math.round(completionPercentage)}%
              </Badge>
            </div>
            <Progress value={completionPercentage} className="w-32" />
            <Button 
              onClick={() => setEditingSection('personal')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Overview Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-600 text-white text-xl">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl text-gray-900">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription className="text-gray-600 flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </CardDescription>
                <CardDescription className="text-gray-600 flex items-center mt-1">
                  <Phone className="h-4 w-4 mr-2" />
                  {user.phoneNumber || 'Not provided'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <CardTitle>Personal Information</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {getCompletionBadge(getSectionCompletion(SECTION_FIELDS.personal))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingSection('personal')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Date of Birth</div>
                  <div className="text-gray-900">{user.dateOfBirth || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Gender</div>
                  <div className="text-gray-900">{user.gender || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Nationality</div>
                  <div className="text-gray-900">{user.nationality || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Passport Number</div>
                  <div className="text-gray-900">{user.passportNumber || 'Not specified'}</div>
                </div>
              </div>
              {user.address && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Address</div>
                  <div className="text-gray-900">{user.address}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <CardTitle>Academic Qualification</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {getCompletionBadge(getSectionCompletion(SECTION_FIELDS.academic))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingSection('academic')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Highest Qualification</div>
                  <div className="text-gray-900">{user.highestQualification || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Institution</div>
                  <div className="text-gray-900">{user.highestInstitution || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Country</div>
                  <div className="text-gray-900">{user.highestCountry || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">GPA/Grade</div>
                  <div className="text-gray-900">{user.highestGpa || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Graduation Year</div>
                  <div className="text-gray-900">{user.graduationYear || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Academic Gap</div>
                  <div className="text-gray-900">{user.currentAcademicGap || 'None'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Preferences */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-purple-600" />
                <CardTitle>Study Preferences</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {getCompletionBadge(getSectionCompletion(SECTION_FIELDS.studyPreferences))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingSection('studyPreferences')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Interested Course</div>
                  <div className="text-gray-900">{user.interestedCourse || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Field of Study</div>
                  <div className="text-gray-900">{user.fieldOfStudy || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Preferred Intake</div>
                  <div className="text-gray-900">{user.preferredIntake || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Budget Range</div>
                  <div className="text-gray-900">{user.budgetRange || 'Not specified'}</div>
                </div>
              </div>
              {user.preferredCountries && user.preferredCountries.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Preferred Countries</div>
                  <div className="flex flex-wrap gap-2">
                    {user.preferredCountries.map((country: string, index: number) => (
                      <Badge key={index} variant="secondary">{country}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-orange-600" />
                <CardTitle>Employment Status</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {getCompletionBadge(getSectionCompletion(SECTION_FIELDS.employment))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingSection('employment')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Employment Status</div>
                  <div className="text-gray-900">{user.currentEmploymentStatus || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Work Experience</div>
                  <div className="text-gray-900">{user.workExperienceYears || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Job Title</div>
                  <div className="text-gray-900">{user.jobTitle || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Organization</div>
                  <div className="text-gray-900">{user.organizationName || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Field of Work</div>
                  <div className="text-gray-900">{user.fieldOfWork || 'Not specified'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-600" />
                <CardTitle>Financial Information</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {getCompletionBadge(getSectionCompletion(SECTION_FIELDS.financial))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingSection('financial')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Funding Source</div>
                  <div className="text-gray-900">{user.fundingSource || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Budget</div>
                  <div className="text-gray-900">{user.estimatedBudget ? formatBudgetRange(user.estimatedBudget) : 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Current Savings</div>
                  <div className="text-gray-900">{user.savingsAmount ? formatSavingsRange(user.savingsAmount) : 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Loan Amount</div>
                  <div className="text-gray-900">{user.loanAmount ? `$${user.loanAmount.toLocaleString()} USD` : 'Not specified'}</div>
                </div>
              </div>
              {user.sponsorDetails && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Sponsor Details</div>
                  <div className="text-gray-900 whitespace-pre-wrap">{user.sponsorDetails}</div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {user.loanApproval && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Loan Pre-approved
                  </Badge>
                )}
                {user.financialDocuments && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Documents Ready
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Language Proficiency */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Languages className="h-5 w-5 text-indigo-600" />
                <CardTitle>Tests & English Proficiency</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {getCompletionBadge(getSectionCompletion(SECTION_FIELDS.language))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingSection('language')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {user.englishProficiencyTests && user.englishProficiencyTests.length > 0 ? (
                <div className="space-y-4">
                  {user.englishProficiencyTests.map((test: any, index: number) => (
                    <Card key={index} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          <div>
                            <div className="text-sm font-medium text-gray-500">Test Type</div>
                            <div className="text-gray-900 font-medium">{test.testType || 'Not specified'}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Overall Score</div>
                            <div className="text-gray-900 font-medium">{test.overallScore || 'Not specified'}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Listening</div>
                            <div className="text-gray-900">{test.listening || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Reading</div>
                            <div className="text-gray-900">{test.reading || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Writing</div>
                            <div className="text-gray-900">{test.writing || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Speaking</div>
                            <div className="text-gray-900">{test.speaking || 'N/A'}</div>
                          </div>
                        </div>
                        {test.testDate && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-sm font-medium text-gray-500">Test Date</div>
                            <div className="text-gray-900">{test.testDate}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Languages className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No language test scores added yet</p>
                  <p className="text-sm">Add your English proficiency test scores to improve your profile</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion Call-to-Action */}
        {completionPercentage < 80 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800">Complete Your Profile</h3>
                  <p className="text-yellow-700 mt-1">
                    Your profile is {completionPercentage}% complete. Complete all sections to get more accurate AI analysis and study destination recommendations.
                  </p>
                </div>
                <Button 
                  onClick={() => setEditingSection('personal')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profile Section Editor Modal */}
      <ProfileSectionEditor
        open={!!editingSection}
        onClose={() => setEditingSection(null)}
        section={editingSection || ''}
        user={user}
      />
    </DashboardLayout>
  );
}