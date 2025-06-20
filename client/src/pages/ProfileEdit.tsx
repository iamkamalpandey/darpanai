import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ArrowLeft, Save, User, GraduationCap, Globe, DollarSign, MapPin, Briefcase, Languages } from 'lucide-react';
import { Link } from 'wouter';

export default function ProfileEdit() {
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  }) as { data: any };

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        nationality: user.nationality || '',
        passportNumber: user.passportNumber || '',
        phoneNumber: user.phoneNumber || '',
        secondaryNumber: user.secondaryNumber || '',
        address: user.address || '',
        
        // Academic Information
        highestQualification: user.highestQualification || '',
        highestInstitution: user.highestInstitution || '',
        highestCountry: user.highestCountry || '',
        highestGpa: user.highestGpa || '',
        graduationYear: user.graduationYear || '',
        currentAcademicGap: user.currentAcademicGap || '',
        
        // Study Preferences
        interestedCourse: user.interestedCourse || '',
        fieldOfStudy: user.fieldOfStudy || '',
        preferredIntake: user.preferredIntake || '',
        budgetRange: user.budgetRange || '',
        preferredCountries: user.preferredCountries || [],
        partTimeInterest: user.partTimeInterest || false,
        accommodationRequired: user.accommodationRequired || false,
        hasDependents: user.hasDependents || false,
        
        // Employment Information
        currentEmploymentStatus: user.currentEmploymentStatus || '',
        workExperienceYears: user.workExperienceYears || '',
        jobTitle: user.jobTitle || '',
        organizationName: user.organizationName || '',
        fieldOfWork: user.fieldOfWork || '',
        gapReasonIfAny: user.gapReasonIfAny || '',
        
        // Language Proficiency
        englishProficiencyTests: user.englishProficiencyTests || [],
        standardizedTests: user.standardizedTests || []
      });
    }
  }, [user]);

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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateMutation.mutateAsync(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLanguageTest = () => {
    const newTest = {
      testType: '',
      overallScore: '',
      listening: '',
      reading: '',
      writing: '',
      speaking: '',
      testDate: '',
      expiryDate: ''
    };
    setFormData(prev => ({
      ...prev,
      englishProficiencyTests: [...(prev.englishProficiencyTests || []), newTest]
    }));
  };

  const handleLanguageTestChange = (index: number, field: string, value: string) => {
    const updatedTests = [...(formData.englishProficiencyTests || [])];
    updatedTests[index] = { ...updatedTests[index], [field]: value };
    setFormData(prev => ({ ...prev, englishProficiencyTests: updatedTests }));
  };

  const handleRemoveLanguageTest = (index: number) => {
    const updatedTests = formData.englishProficiencyTests.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, englishProficiencyTests: updatedTests }));
  };

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Personal Information
            </CardTitle>
            <CardDescription>Basic details for accurate analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName || ''} 
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName || ''} 
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input 
                  id="dateOfBirth" 
                  type="date" 
                  value={formData.dateOfBirth || ''} 
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.gender || ''} 
                  onValueChange={(value) => handleInputChange('gender', value)}
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
                  value={formData.nationality || ''} 
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="e.g., Indian, Nepali, Pakistani"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passportNumber">Passport Number</Label>
                <Input 
                  id="passportNumber" 
                  value={formData.passportNumber || ''} 
                  onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                  placeholder="Enter passport number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input 
                  id="phoneNumber" 
                  value={formData.phoneNumber || ''} 
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryNumber">Secondary Number</Label>
                <Input 
                  id="secondaryNumber" 
                  value={formData.secondaryNumber || ''} 
                  onChange={(e) => handleInputChange('secondaryNumber', e.target.value)}
                  placeholder="Enter secondary number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                value={formData.address || ''} 
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
              Academic Qualification
            </CardTitle>
            <CardDescription>Education history for program matching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="highestQualification">Highest Qualification</Label>
                <Select 
                  value={formData.highestQualification || ''} 
                  onValueChange={(value) => handleInputChange('highestQualification', value)}
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
                  value={formData.highestInstitution || ''} 
                  onChange={(e) => handleInputChange('highestInstitution', e.target.value)}
                  placeholder="Enter institution name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highestCountry">Country of Education</Label>
                <Input 
                  id="highestCountry" 
                  value={formData.highestCountry || ''} 
                  onChange={(e) => handleInputChange('highestCountry', e.target.value)}
                  placeholder="Enter country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highestGpa">GPA/Grade</Label>
                <Input 
                  id="highestGpa" 
                  value={formData.highestGpa || ''} 
                  onChange={(e) => handleInputChange('highestGpa', e.target.value)}
                  placeholder="e.g., 3.8, 85%, First Class"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input 
                  id="graduationYear" 
                  type="number" 
                  value={formData.graduationYear || ''} 
                  onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  placeholder="e.g., 2023"
                  min="1980"
                  max="2030"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentAcademicGap">Academic Gap (if any)</Label>
                <Input 
                  id="currentAcademicGap" 
                  value={formData.currentAcademicGap || ''} 
                  onChange={(e) => handleInputChange('currentAcademicGap', e.target.value)}
                  placeholder="e.g., 2 years working"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-purple-600" />
              Study Preferences
            </CardTitle>
            <CardDescription>Course and country preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interestedCourse">Interested Course</Label>
                <Input 
                  id="interestedCourse" 
                  value={formData.interestedCourse || ''} 
                  onChange={(e) => handleInputChange('interestedCourse', e.target.value)}
                  placeholder="e.g., Computer Science, MBA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Select 
                  value={formData.fieldOfStudy || ''} 
                  onValueChange={(value) => handleInputChange('fieldOfStudy', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Medicine">Medicine</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Arts & Humanities">Arts & Humanities</SelectItem>
                    <SelectItem value="Social Sciences">Social Sciences</SelectItem>
                    <SelectItem value="Natural Sciences">Natural Sciences</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredIntake">Preferred Intake</Label>
                <Select 
                  value={formData.preferredIntake || ''} 
                  onValueChange={(value) => handleInputChange('preferredIntake', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select intake" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                    <SelectItem value="Spring 2026">Spring 2026</SelectItem>
                    <SelectItem value="Summer 2026">Summer 2026</SelectItem>
                    <SelectItem value="Fall 2026">Fall 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetRange">Budget Range (USD)</Label>
                <Select 
                  value={formData.budgetRange || ''} 
                  onValueChange={(value) => handleInputChange('budgetRange', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$10,000 - $25,000">$10,000 - $25,000</SelectItem>
                    <SelectItem value="$25,000 - $50,000">$25,000 - $50,000</SelectItem>
                    <SelectItem value="$50,000 - $75,000">$50,000 - $75,000</SelectItem>
                    <SelectItem value="$75,000 - $100,000">$75,000 - $100,000</SelectItem>
                    <SelectItem value="$100,000+">$100,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="partTimeInterest" 
                  checked={formData.partTimeInterest || false}
                  onCheckedChange={(checked) => handleInputChange('partTimeInterest', checked)}
                />
                <Label htmlFor="partTimeInterest">Interested in part-time work opportunities</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="accommodationRequired" 
                  checked={formData.accommodationRequired || false}
                  onCheckedChange={(checked) => handleInputChange('accommodationRequired', checked)}
                />
                <Label htmlFor="accommodationRequired">Require university accommodation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasDependents" 
                  checked={formData.hasDependents || false}
                  onCheckedChange={(checked) => handleInputChange('hasDependents', checked)}
                />
                <Label htmlFor="hasDependents">Have dependents (spouse/children)</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-orange-600" />
              Employment Status
            </CardTitle>
            <CardDescription>Work experience for visa applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentEmploymentStatus">Employment Status</Label>
                <Select 
                  value={formData.currentEmploymentStatus || ''} 
                  onValueChange={(value) => handleInputChange('currentEmploymentStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Employed Full-time">Employed Full-time</SelectItem>
                    <SelectItem value="Employed Part-time">Employed Part-time</SelectItem>
                    <SelectItem value="Self-employed">Self-employed</SelectItem>
                    <SelectItem value="Unemployed">Unemployed</SelectItem>
                    <SelectItem value="Gap Year">Gap Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workExperienceYears">Work Experience (Years)</Label>
                <Select 
                  value={formData.workExperienceYears || ''} 
                  onValueChange={(value) => handleInputChange('workExperienceYears', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No experience</SelectItem>
                    <SelectItem value="1">1 year</SelectItem>
                    <SelectItem value="2">2 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5+">5+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input 
                  id="jobTitle" 
                  value={formData.jobTitle || ''} 
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="Enter job title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input 
                  id="organizationName" 
                  value={formData.organizationName || ''} 
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  placeholder="Enter organization name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fieldOfWork">Field of Work</Label>
                <Input 
                  id="fieldOfWork" 
                  value={formData.fieldOfWork || ''} 
                  onChange={(e) => handleInputChange('fieldOfWork', e.target.value)}
                  placeholder="e.g., IT, Finance, Healthcare"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gapReasonIfAny">Gap Reason (if any)</Label>
                <Input 
                  id="gapReasonIfAny" 
                  value={formData.gapReasonIfAny || ''} 
                  onChange={(e) => handleInputChange('gapReasonIfAny', e.target.value)}
                  placeholder="Reason for employment gap"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Proficiency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Languages className="h-5 w-5 mr-2 text-indigo-600" />
              Tests & English Proficiency
            </CardTitle>
            <CardDescription>Language scores for admission requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">English Proficiency Tests</h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLanguageTest}>
                Add Test
              </Button>
            </div>
            
            {formData.englishProficiencyTests && formData.englishProficiencyTests.length > 0 ? (
              <div className="space-y-4">
                {formData.englishProficiencyTests.map((test: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Test Type</Label>
                        <Select 
                          value={test.testType || ''} 
                          onValueChange={(value) => handleLanguageTestChange(index, 'testType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select test" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IELTS">IELTS</SelectItem>
                            <SelectItem value="TOEFL">TOEFL</SelectItem>
                            <SelectItem value="PTE">PTE</SelectItem>
                            <SelectItem value="Duolingo">Duolingo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Overall Score</Label>
                        <Input 
                          value={test.overallScore || ''} 
                          onChange={(e) => handleLanguageTestChange(index, 'overallScore', e.target.value)}
                          placeholder="Overall score"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Test Date</Label>
                        <Input 
                          type="date"
                          value={test.testDate || ''} 
                          onChange={(e) => handleLanguageTestChange(index, 'testDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label>Listening</Label>
                        <Input 
                          value={test.listening || ''} 
                          onChange={(e) => handleLanguageTestChange(index, 'listening', e.target.value)}
                          placeholder="Score"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Reading</Label>
                        <Input 
                          value={test.reading || ''} 
                          onChange={(e) => handleLanguageTestChange(index, 'reading', e.target.value)}
                          placeholder="Score"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Writing</Label>
                        <Input 
                          value={test.writing || ''} 
                          onChange={(e) => handleLanguageTestChange(index, 'writing', e.target.value)}
                          placeholder="Score"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Speaking</Label>
                        <Input 
                          value={test.speaking || ''} 
                          onChange={(e) => handleLanguageTestChange(index, 'speaking', e.target.value)}
                          placeholder="Score"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleRemoveLanguageTest(index)}
                      >
                        Remove Test
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Languages className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No language tests added yet</p>
                <p className="text-sm">Click "Add Test" to include your English proficiency scores</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isLoading || updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}