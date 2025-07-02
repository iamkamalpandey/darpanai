import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  User, 
  CheckCircle, 
  Edit, 
  Save, 
  X, 
  Brain, 
  Clock, 
  ArrowRight,
  FileText,
  Phone,
  Mail,
  Calendar,
  Globe,
  GraduationCap,
  Target,
  DollarSign,
  Award
} from 'lucide-react';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
  studyLevel?: string;
  fieldOfStudy?: string;
  preferredCountries?: string[];
  budgetRange?: string;
  englishProficiency?: string;
  workExperience?: string;
  academicBackground?: string;
  careerGoals?: string;
  timeline?: string;
  fundingSource?: string;
  additionalRequirements?: string;
}

interface EditingSection {
  section: string;
  isEditing: boolean;
}

export default function ProfileBasedApplication() {
  const [editingSections, setEditingSections] = useState<EditingSection[]>([]);
  const [editedData, setEditedData] = useState<Partial<UserProfile>>({});
  const [step, setStep] = useState<'review' | 'verify' | 'submit'>('review');
  const queryClient = useQueryClient();

  // Load user profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
  }) as { data: UserProfile; isLoading: boolean };

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      return await apiRequest('PATCH', '/api/user/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({ title: 'Profile updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  });

  // Application submission mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      return await apiRequest('POST', '/api/student-applications', applicationData);
    },
    onSuccess: () => {
      toast({ title: 'Application submitted successfully!' });
      // Redirect to application tracking
      window.location.href = '/student-applications';
    },
    onError: () => {
      toast({ title: 'Failed to submit application', variant: 'destructive' });
    }
  });

  const isEditing = (section: string) => {
    return editingSections.some(item => item.section === section && item.isEditing);
  };

  const startEditing = (section: string) => {
    setEditingSections(prev => [
      ...prev.filter(item => item.section !== section),
      { section, isEditing: true }
    ]);
    // Initialize editing data with current profile values
    setEditedData(prev => ({ ...prev, ...profile }));
  };

  const stopEditing = (section: string) => {
    setEditingSections(prev => prev.filter(item => item.section !== section));
    setEditedData(prev => {
      const newData = { ...prev };
      // Remove section-specific fields based on section
      if (section === 'personal') {
        delete newData.firstName;
        delete newData.lastName;
        delete newData.phoneNumber;
        delete newData.dateOfBirth;
        delete newData.nationality;
      }
      // Add other sections as needed
      return newData;
    });
  };

  const saveSection = async (section: string) => {
    const sectionData = getSectionData(section);
    await updateProfileMutation.mutateAsync(sectionData);
    stopEditing(section);
  };

  const getSectionData = (section: string): Partial<UserProfile> => {
    switch (section) {
      case 'personal':
        return {
          firstName: editedData.firstName,
          lastName: editedData.lastName,
          phoneNumber: editedData.phoneNumber,
          dateOfBirth: editedData.dateOfBirth,
          nationality: editedData.nationality,
        };
      case 'academic':
        return {
          studyLevel: editedData.studyLevel,
          fieldOfStudy: editedData.fieldOfStudy,
          academicBackground: editedData.academicBackground,
          englishProficiency: editedData.englishProficiency,
        };
      case 'preferences':
        return {
          preferredCountries: editedData.preferredCountries,
          budgetRange: editedData.budgetRange,
          timeline: editedData.timeline,
          fundingSource: editedData.fundingSource,
        };
      case 'goals':
        return {
          careerGoals: editedData.careerGoals,
          workExperience: editedData.workExperience,
          additionalRequirements: editedData.additionalRequirements,
        };
      default:
        return {};
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    const fields = [
      profile.firstName, profile.lastName, profile.email, profile.phoneNumber,
      profile.studyLevel, profile.fieldOfStudy, profile.preferredCountries,
      profile.budgetRange, profile.careerGoals
    ];
    const completedFields = fields.filter(field => field && field !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const canProceedToVerification = () => {
    return getCompletionPercentage() >= 80;
  };

  const submitApplication = async () => {
    const applicationData = {
      applicationNumber: `APP-${Date.now()}`,
      userId: profile.id,
      studyLevel: profile.studyLevel || '',
      fieldOfStudy: profile.fieldOfStudy || '',
      targetCountry: profile.preferredCountries?.[0] || '',
      preferredIntake: profile.timeline || 'Not specified',
      budgetRange: profile.budgetRange || '',
      fundingSource: profile.fundingSource || 'Not specified',
      status: 'draft' as const,
      priority: 'medium' as const,
      personalDetails: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber || '',
        dateOfBirth: profile.dateOfBirth || '',
        nationality: profile.nationality || '',
      },
      academicBackground: profile.academicBackground || '',
      careerGoals: profile.careerGoals || '',
      englishProficiency: profile.englishProficiency || '',
      workExperience: profile.workExperience || '',
      additionalRequirements: profile.additionalRequirements || '',
      submittedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    await submitApplicationMutation.mutateAsync(applicationData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Profile-Based Application</h1>
          <p className="text-lg text-gray-600 mt-2">
            Review and verify your profile information to create your study abroad application
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Review Profile</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <div className={`flex items-center ${step === 'verify' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 'verify' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Verify Details</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <div className={`flex items-center ${step === 'submit' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 'submit' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Submit Application</span>
            </div>
          </div>
        </div>

        {/* Profile Completion Status */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
                <p className="text-sm text-gray-600">
                  {getCompletionPercentage()}% complete • {canProceedToVerification() ? 'Ready for application' : 'Complete your profile to proceed'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`rounded-full h-12 w-12 flex items-center justify-center ${
                  getCompletionPercentage() >= 80 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {getCompletionPercentage()}%
                </div>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getCompletionPercentage() >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {step === 'review' && (
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </CardTitle>
                {!isEditing('personal') ? (
                  <Button variant="outline" size="sm" onClick={() => startEditing('personal')}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => saveSection('personal')}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => stopEditing('personal')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!isEditing('personal') ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                      <p className="text-gray-900">{profile?.firstName} {profile?.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-gray-900">{profile?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                      <p className="text-gray-900">{profile?.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                      <p className="text-gray-900">{profile?.dateOfBirth || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nationality</Label>
                      <p className="text-gray-900">{profile?.nationality || 'Not provided'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editedData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editedData.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={editedData.phoneNumber || ''}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={editedData.dateOfBirth || ''}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={editedData.nationality || ''}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                  Academic Information
                </CardTitle>
                {!isEditing('academic') ? (
                  <Button variant="outline" size="sm" onClick={() => startEditing('academic')}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => saveSection('academic')}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => stopEditing('academic')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!isEditing('academic') ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Study Level</Label>
                      <p className="text-gray-900">{profile?.studyLevel || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Field of Study</Label>
                      <p className="text-gray-900">{profile?.fieldOfStudy || 'Not specified'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-500">Academic Background</Label>
                      <p className="text-gray-900">{profile?.academicBackground || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">English Proficiency</Label>
                      <p className="text-gray-900">{profile?.englishProficiency || 'Not specified'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studyLevel">Study Level</Label>
                      <Select value={editedData.studyLevel || ''} onValueChange={(value) => handleInputChange('studyLevel', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select study level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                          <SelectItem value="master">Master's Degree</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="diploma">Diploma</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fieldOfStudy">Field of Study</Label>
                      <Input
                        id="fieldOfStudy"
                        value={editedData.fieldOfStudy || ''}
                        onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                        placeholder="e.g., Computer Science, Business, Engineering"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="academicBackground">Academic Background</Label>
                      <Textarea
                        id="academicBackground"
                        value={editedData.academicBackground || ''}
                        onChange={(e) => handleInputChange('academicBackground', e.target.value)}
                        placeholder="Describe your educational background, qualifications, and achievements"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="englishProficiency">English Proficiency</Label>
                      <Select value={editedData.englishProficiency || ''} onValueChange={(value) => handleInputChange('englishProficiency', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select proficiency level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="native">Native Speaker</SelectItem>
                          <SelectItem value="fluent">Fluent</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="beginner">Beginner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Study Preferences */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Study Preferences
                </CardTitle>
                {!isEditing('preferences') ? (
                  <Button variant="outline" size="sm" onClick={() => startEditing('preferences')}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => saveSection('preferences')}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => stopEditing('preferences')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!isEditing('preferences') ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Preferred Countries</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile?.preferredCountries?.map((country) => (
                          <Badge key={country} variant="secondary">{country}</Badge>
                        )) || <p className="text-gray-900">Not specified</p>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Budget Range</Label>
                      <p className="text-gray-900">{profile?.budgetRange || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Timeline</Label>
                      <p className="text-gray-900">{profile?.timeline || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Funding Source</Label>
                      <p className="text-gray-900">{profile?.fundingSource || 'Not specified'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budgetRange">Budget Range</Label>
                      <Select value={editedData.budgetRange || ''} onValueChange={(value) => handleInputChange('budgetRange', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-20k">Under $20,000</SelectItem>
                          <SelectItem value="20k-40k">$20,000 - $40,000</SelectItem>
                          <SelectItem value="40k-60k">$40,000 - $60,000</SelectItem>
                          <SelectItem value="60k-80k">$60,000 - $80,000</SelectItem>
                          <SelectItem value="above-80k">Above $80,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeline">Timeline</Label>
                      <Select value={editedData.timeline || ''} onValueChange={(value) => handleInputChange('timeline', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate (Next 3 months)</SelectItem>
                          <SelectItem value="short-term">Short-term (3-6 months)</SelectItem>
                          <SelectItem value="medium-term">Medium-term (6-12 months)</SelectItem>
                          <SelectItem value="long-term">Long-term (1+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fundingSource">Funding Source</Label>
                      <Select value={editedData.fundingSource || ''} onValueChange={(value) => handleInputChange('fundingSource', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select funding source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="self-funded">Self-funded</SelectItem>
                          <SelectItem value="family-funded">Family funded</SelectItem>
                          <SelectItem value="scholarship">Scholarship</SelectItem>
                          <SelectItem value="loan">Educational loan</SelectItem>
                          <SelectItem value="employer">Employer sponsored</SelectItem>
                          <SelectItem value="mixed">Mixed sources</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Career Goals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-600" />
                  Career Goals & Experience
                </CardTitle>
                {!isEditing('goals') ? (
                  <Button variant="outline" size="sm" onClick={() => startEditing('goals')}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => saveSection('goals')}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => stopEditing('goals')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!isEditing('goals') ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Career Goals</Label>
                      <p className="text-gray-900">{profile?.careerGoals || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Work Experience</Label>
                      <p className="text-gray-900">{profile?.workExperience || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Additional Requirements</Label>
                      <p className="text-gray-900">{profile?.additionalRequirements || 'Not provided'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="careerGoals">Career Goals</Label>
                      <Textarea
                        id="careerGoals"
                        value={editedData.careerGoals || ''}
                        onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                        placeholder="Describe your career aspirations and how this study program will help achieve them"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="workExperience">Work Experience</Label>
                      <Textarea
                        id="workExperience"
                        value={editedData.workExperience || ''}
                        onChange={(e) => handleInputChange('workExperience', e.target.value)}
                        placeholder="Describe your relevant work experience and professional background"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="additionalRequirements">Additional Requirements</Label>
                      <Textarea
                        id="additionalRequirements"
                        value={editedData.additionalRequirements || ''}
                        onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
                        placeholder="Any specific requirements or preferences for your study abroad experience"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button 
                onClick={() => setStep('verify')} 
                disabled={!canProceedToVerification()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {canProceedToVerification() ? 'Proceed to Verification' : `Complete Profile (${getCompletionPercentage()}%)`}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Verification Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Profile Ready for Application</h4>
                    <p className="text-sm text-green-700">
                      Your profile is {getCompletionPercentage()}% complete and contains all necessary information 
                      to create a comprehensive study abroad application.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Personal information verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Academic background complete</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Study preferences defined</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Career goals outlined</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('review')}>
                Back to Review
              </Button>
              <Button 
                onClick={() => setStep('submit')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Application
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 'submit' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Application Submission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Ready to Submit</h4>
                    <p className="text-sm text-blue-700">
                      Your application will be created using your verified profile information. 
                      Our experts will contact you within 24 hours to guide you through the next steps.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Application Type</Label>
                      <p className="text-gray-900">{profile?.studyLevel} in {profile?.fieldOfStudy}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Target Country</Label>
                      <p className="text-gray-900">{profile?.preferredCountries?.[0] || 'To be determined'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Budget Range</Label>
                      <p className="text-gray-900">{profile?.budgetRange}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Timeline</Label>
                      <p className="text-gray-900">{profile?.timeline}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">What Happens Next?</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Your application will be created and assigned a tracking number</li>
                      <li>• Our education experts will review your profile</li>
                      <li>• You'll receive personalized university and program recommendations</li>
                      <li>• Expert guidance on document preparation and application requirements</li>
                      <li>• Regular updates on your application progress</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('verify')}>
                Back to Verification
              </Button>
              <Button 
                onClick={submitApplication}
                disabled={submitApplicationMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitApplicationMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}