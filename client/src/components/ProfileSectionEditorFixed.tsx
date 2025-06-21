import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileSectionEditorProps {
  open: boolean;
  onClose: () => void;
  section: string;
  user: any;
}

export function ProfileSectionEditor({ open, onClose, section, user }: ProfileSectionEditorProps) {
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form data when dialog opens
  useEffect(() => {
    if (user && open) {
      console.log('Initializing form data for section:', section);
      console.log('User data:', user);
      setFormData({ ...user });
    }
  }, [user, open, section]);

  // CRUD Operations: UPDATE mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user/complete-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: async (data) => {
      console.log('Profile updated successfully:', data);
      
      // Clear cache and refresh data
      queryClient.removeQueries({ queryKey: ['/api/user'] });
      queryClient.removeQueries({ queryKey: ['/api/user/fresh'] });
      queryClient.removeQueries({ queryKey: ['/api/user/profile-completion'] });
      
      // Set fresh data
      if (data.user) {
        queryClient.setQueryData(['/api/user'], data.user);
        queryClient.setQueryData(['/api/user/fresh'], data.user);
      }
      
      // Trigger profile update event
      window.dispatchEvent(new CustomEvent('profile-updated', { 
        detail: { section, updatedData: data.user }
      }));
      
      toast({
        title: 'Profile Updated',
        description: `${getSectionTitle()} has been successfully saved.`,
      });
      
      onClose();
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save operation
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Get section-specific fields
      const sectionFields = getSectionFields(section);
      const submitData: any = {};
      
      // Only include relevant fields for this section
      sectionFields.forEach(field => {
        if (formData.hasOwnProperty(field)) {
          let value = formData[field];
          
          // Handle empty strings
          if (typeof value === 'string' && value.trim() === '') {
            value = null;
          }
          
          // Type conversions
          if (field === 'graduationYear' && value) {
            value = parseInt(value, 10);
          }
          
          if (field === 'currentAcademicGap' && value) {
            const numValue = parseInt(value, 10);
            value = !isNaN(numValue) ? numValue : null;
          }
          
          submitData[field] = value;
        }
      });
      
      console.log('Submitting data for section:', section, submitData);
      updateMutation.mutate(submitData);
    } finally {
      setIsLoading(false);
    }
  };

  // Get section title
  const getSectionTitle = () => {
    switch (section) {
      case 'personal': return 'Personal Information';
      case 'academic': return 'Academic Qualification';
      case 'study': return 'Study Preferences';
      case 'financial': return 'Financial Information';
      case 'employment': return 'Employment Information';
      case 'language': return 'Language Proficiency';
      default: return 'Profile Section';
    }
  };

  // Get fields for each section
  const getSectionFields = (section: string): string[] => {
    switch (section) {
      case 'personal':
        return ['firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'phoneNumber', 'secondaryNumber', 'passportNumber', 'address'];
      case 'academic':
        return ['highestQualification', 'highestInstitution', 'highestCountry', 'highestGpa', 'graduationYear', 'currentAcademicGap', 'educationHistory'];
      case 'study':
        return ['interestedCourse', 'fieldOfStudy', 'preferredIntake', 'budgetRange', 'preferredCountries', 'interestedServices', 'partTimeInterest', 'accommodationRequired', 'hasDependents'];
      case 'financial':
        return ['fundingSource', 'estimatedBudget', 'savingsAmount', 'loanApproval', 'loanAmount', 'sponsorDetails', 'financialDocuments'];
      case 'employment':
        return ['currentEmploymentStatus', 'workExperienceYears', 'jobTitle', 'organizationName', 'fieldOfWork', 'gapReasonIfAny'];
      case 'language':
        return ['englishProficiencyTests', 'standardizedTests'];
      default:
        return [];
    }
  };

  // Render section content
  const renderSectionContent = () => {
    switch (section) {
      case 'personal':
        return renderPersonalInformation();
      case 'academic':
        return renderAcademicInformation();
      case 'study':
        return renderStudyPreferences();
      case 'financial':
        return renderFinancialInformation();
      case 'employment':
        return renderEmploymentInformation();
      case 'language':
        return renderLanguageProficiency();
      default:
        return <div>Section not found</div>;
    }
  };

  // Personal Information Form
  const renderPersonalInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName || ''}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName || ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter your last name"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
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
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nationality">Nationality *</Label>
          <Input
            id="nationality"
            value={formData.nationality || ''}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            placeholder="Your nationality"
          />
        </div>
        <div>
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="+1234567890"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="passportNumber">Passport Number</Label>
          <Input
            id="passportNumber"
            value={formData.passportNumber || ''}
            onChange={(e) => handleInputChange('passportNumber', e.target.value)}
            placeholder="Passport number"
          />
        </div>
        <div>
          <Label htmlFor="secondaryNumber">Secondary Phone</Label>
          <Input
            id="secondaryNumber"
            value={formData.secondaryNumber || ''}
            onChange={(e) => handleInputChange('secondaryNumber', e.target.value)}
            placeholder="Alternative phone number"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Your complete address"
          rows={3}
        />
      </div>
    </div>
  );

  // Academic Information Form
  const renderAcademicInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="highestQualification">Highest Qualification *</Label>
          <Select value={formData.highestQualification || ''} onValueChange={(value) => handleInputChange('highestQualification', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select qualification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
              <SelectItem value="Master's Degree">Master's Degree</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="highestInstitution">Institution Name *</Label>
          <Input
            id="highestInstitution"
            value={formData.highestInstitution || ''}
            onChange={(e) => handleInputChange('highestInstitution', e.target.value)}
            placeholder="Name of your institution"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="highestGpa">GPA/Grade *</Label>
          <Input
            id="highestGpa"
            value={formData.highestGpa || ''}
            onChange={(e) => handleInputChange('highestGpa', e.target.value)}
            placeholder="e.g., 3.5, 85%, A"
          />
        </div>
        <div>
          <Label htmlFor="graduationYear">Graduation Year *</Label>
          <Input
            id="graduationYear"
            type="number"
            min="1980"
            max="2030"
            value={formData.graduationYear || ''}
            onChange={(e) => handleInputChange('graduationYear', e.target.value)}
            placeholder="2024"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="educationHistory">Education History</Label>
        <Textarea
          id="educationHistory"
          value={formData.educationHistory || ''}
          onChange={(e) => handleInputChange('educationHistory', e.target.value)}
          placeholder="Brief description of your educational background"
          rows={3}
        />
      </div>
    </div>
  );

  // Employment Information Form
  const renderEmploymentInformation = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="currentEmploymentStatus">Employment Status *</Label>
        <Select value={formData.currentEmploymentStatus || ''} onValueChange={(value) => handleInputChange('currentEmploymentStatus', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select employment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Student">Student</SelectItem>
            <SelectItem value="Employed Full-time">Employed Full-time</SelectItem>
            <SelectItem value="Employed Part-time">Employed Part-time</SelectItem>
            <SelectItem value="Self-employed">Self-employed</SelectItem>
            <SelectItem value="Unemployed">Unemployed</SelectItem>
            <SelectItem value="Career Break">Career Break</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="workExperienceYears">Work Experience</Label>
          <Select value={formData.workExperienceYears || ''} onValueChange={(value) => handleInputChange('workExperienceYears', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No experience</SelectItem>
              <SelectItem value="1">1 year</SelectItem>
              <SelectItem value="2">2 years</SelectItem>
              <SelectItem value="3">3 years</SelectItem>
              <SelectItem value="4">4 years</SelectItem>
              <SelectItem value="5+">5+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle || ''}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            placeholder="Your current/last job title"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="organizationName">Organization</Label>
          <Input
            id="organizationName"
            value={formData.organizationName || ''}
            onChange={(e) => handleInputChange('organizationName', e.target.value)}
            placeholder="Company/organization name"
          />
        </div>
        <div>
          <Label htmlFor="fieldOfWork">Field of Work</Label>
          <Input
            id="fieldOfWork"
            value={formData.fieldOfWork || ''}
            onChange={(e) => handleInputChange('fieldOfWork', e.target.value)}
            placeholder="e.g., Technology, Healthcare"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="gapReasonIfAny">Gap Reason (if any)</Label>
        <Textarea
          id="gapReasonIfAny"
          value={formData.gapReasonIfAny || ''}
          onChange={(e) => handleInputChange('gapReasonIfAny', e.target.value)}
          placeholder="Explain any employment gaps"
          rows={2}
        />
      </div>
    </div>
  );

  // Study Preferences Form
  const renderStudyPreferences = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="interestedCourse">Interested Course *</Label>
          <Input
            id="interestedCourse"
            value={formData.interestedCourse || ''}
            onChange={(e) => handleInputChange('interestedCourse', e.target.value)}
            placeholder="Course you want to study"
          />
        </div>
        <div>
          <Label htmlFor="fieldOfStudy">Field of Study *</Label>
          <Select value={formData.fieldOfStudy || ''} onValueChange={(value) => handleInputChange('fieldOfStudy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Medicine">Medicine</SelectItem>
              <SelectItem value="Arts">Arts</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="preferredIntake">Preferred Intake *</Label>
          <Select value={formData.preferredIntake || ''} onValueChange={(value) => handleInputChange('preferredIntake', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select intake" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fall 2024">Fall 2024</SelectItem>
              <SelectItem value="Spring 2025">Spring 2025</SelectItem>
              <SelectItem value="Summer 2025">Summer 2025</SelectItem>
              <SelectItem value="Fall 2025">Fall 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="budgetRange">Budget Range *</Label>
          <Select value={formData.budgetRange || ''} onValueChange={(value) => handleInputChange('budgetRange', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-25000">Under $25,000</SelectItem>
              <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
              <SelectItem value="50000-75000">$50,000 - $75,000</SelectItem>
              <SelectItem value="75000-100000">$75,000 - $100,000</SelectItem>
              <SelectItem value="over-100000">Over $100,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  // Financial Information Form
  const renderFinancialInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fundingSource">Funding Source *</Label>
          <Select value={formData.fundingSource || ''} onValueChange={(value) => handleInputChange('fundingSource', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select funding source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Self-funded">Self-funded</SelectItem>
              <SelectItem value="Family-funded">Family-funded</SelectItem>
              <SelectItem value="Bank Loan">Bank Loan</SelectItem>
              <SelectItem value="Scholarship">Scholarship</SelectItem>
              <SelectItem value="Education Loan">Education Loan</SelectItem>
              <SelectItem value="Mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="estimatedBudget">Total Budget *</Label>
          <Select value={formData.estimatedBudget || ''} onValueChange={(value) => handleInputChange('estimatedBudget', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-25000">Under $25,000</SelectItem>
              <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
              <SelectItem value="50000-75000">$50,000 - $75,000</SelectItem>
              <SelectItem value="75000-100000">$75,000 - $100,000</SelectItem>
              <SelectItem value="over-100000">Over $100,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="savingsAmount">Current Savings</Label>
          <Select value={formData.savingsAmount || ''} onValueChange={(value) => handleInputChange('savingsAmount', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select savings amount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-5000">Under $5,000</SelectItem>
              <SelectItem value="5000-15000">$5,000 - $15,000</SelectItem>
              <SelectItem value="15000-30000">$15,000 - $30,000</SelectItem>
              <SelectItem value="30000-50000">$30,000 - $50,000</SelectItem>
              <SelectItem value="over-50000">Over $50,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="loanApproval">Loan Pre-approval</Label>
          <Select value={formData.loanApproval?.toString() || ''} onValueChange={(value) => handleInputChange('loanApproval', value === 'true')}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  // Language Proficiency Form
  const renderLanguageProficiency = () => (
    <div className="space-y-4">
      <div>
        <Label>English Proficiency Tests</Label>
        <p className="text-sm text-gray-600 mb-4">Add your English test scores (optional but recommended)</p>
        
        {formData.englishProficiencyTests && formData.englishProficiencyTests.length > 0 ? (
          <div className="space-y-3">
            {formData.englishProficiencyTests.map((test: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{test.testType}</Badge>
                      <span className="font-semibold">{test.overallScore}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedTests = formData.englishProficiencyTests.filter((_: any, i: number) => i !== index);
                        handleInputChange('englishProficiencyTests', updatedTests);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Test Date: {test.testDate ? new Date(test.testDate).toLocaleDateString() : 'Not specified'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No English tests added yet</p>
        )}
        
        <Button
          variant="outline"
          onClick={() => {
            const newTest = {
              testType: 'IELTS',
              overallScore: '',
              testDate: new Date().toISOString().split('T')[0],
              reading: '',
              writing: '',
              speaking: '',
              listening: ''
            };
            const currentTests = formData.englishProficiencyTests || [];
            handleInputChange('englishProficiencyTests', [...currentTests, newTest]);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add English Test
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getSectionTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {renderSectionContent()}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading || updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}