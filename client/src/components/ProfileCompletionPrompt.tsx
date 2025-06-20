import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, User, GraduationCap, Globe, DollarSign, MapPin, Briefcase, Languages, X, Trophy, Target, FileText, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

const PROFILE_SECTIONS = [
  { id: 'personal', label: 'Personal Information', icon: User, description: 'Basic details for accurate analysis' },
  { id: 'academic', label: 'Academic Qualification', icon: GraduationCap, description: 'Education history for program matching' },
  { id: 'study', label: 'Study Preferences', icon: Globe, description: 'Course and country preferences' },
  { id: 'budget', label: 'Budget Range', icon: DollarSign, description: 'Financial planning for accurate recommendations' },
  { id: 'countries', label: 'Preferred Countries', icon: MapPin, description: 'Target destinations for personalized analysis' },
  { id: 'employment', label: 'Employment Status', icon: Briefcase, description: 'Work experience for visa applications' },
  { id: 'tests', label: 'Tests & English Proficiency', icon: Languages, description: 'Language scores for admission requirements' }
];

interface ProfileCompletionPromptProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileCompletionPrompt({ open, onClose }: ProfileCompletionPromptProps) {
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  }) as { data: any };

  // Calculate completion based on actual user data
  const COMPULSORY_FIELDS = [
    'firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'phoneNumber',
    'highestQualification', 'highestInstitution', 'highestGpa', 'graduationYear',
    'interestedCourse', 'fieldOfStudy', 'preferredIntake', 'budgetRange',
    'preferredCountries', 'currentEmploymentStatus', 'englishProficiencyTests'
  ];

  const calculateCompletion = () => {
    if (!user) return { percentage: 0, completedFields: 0, totalFields: COMPULSORY_FIELDS.length, missingFields: COMPULSORY_FIELDS };
    
    const completedFields = COMPULSORY_FIELDS.filter(field => {
      const value = user[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
    
    const missingFields = COMPULSORY_FIELDS.filter(field => {
      const value = user[field];
      if (Array.isArray(value)) return value.length === 0;
      return value === null || value === undefined || value === '';
    });
    
    const percentage = Math.round((completedFields.length / COMPULSORY_FIELDS.length) * 100);
    
    return {
      percentage,
      completedFields: completedFields.length,
      totalFields: COMPULSORY_FIELDS.length,
      missingFields
    };
  };

  const completion = calculateCompletion();
  const completionPercentage = completion.percentage;

  const getSectionStatus = (sectionId: string) => {
    if (!user) return false;
    
    const sectionFieldMap: { [key: string]: string[] } = {
      personal: ['dateOfBirth', 'gender', 'nationality', 'passportNumber'],
      academic: ['highestQualification', 'highestInstitution', 'highestGpa', 'graduationYear'],
      study: ['interestedCourse', 'fieldOfStudy', 'preferredIntake'],
      budget: ['budgetRange'],
      countries: ['preferredCountries'],
      employment: ['currentEmploymentStatus', 'workExperienceYears'],
      tests: ['englishProficiencyTests']
    };

    const sectionFields = sectionFieldMap[sectionId] || [];
    const completedSectionFields = sectionFields.filter(field => {
      const value = user[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
    
    return completedSectionFields.length === sectionFields.length;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Complete Your Profile for Better AI Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Profile Completion</h3>
              <Badge variant={completionPercentage >= 80 ? 'default' : completionPercentage >= 50 ? 'secondary' : 'destructive'}>
                {Math.round(completionPercentage)}% Complete
              </Badge>
            </div>
            <Progress value={completionPercentage} className="mb-3" />
            <p className="text-sm text-gray-600">
              A complete profile helps our AI provide more accurate study destination recommendations and document analysis.
            </p>
          </div>

          {/* Enhanced Benefits Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-800 mb-4 text-lg">🎯 Unlock Premium AI Analysis Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                    <Trophy className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-green-800">Personalized Study Destinations</h5>
                    <p className="text-sm text-green-700">AI matches 50+ countries based on your academic profile, budget, and preferences</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-blue-800">Smart Scholarship Matching</h5>
                    <p className="text-sm text-blue-700">Find scholarships worth $10K-$100K+ tailored to your nationality and field</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-3 mt-1">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-purple-800">Enhanced Document Analysis</h5>
                    <p className="text-sm text-purple-700">90% more accurate visa analysis with your complete academic history</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-orange-100 p-2 rounded-full mr-3 mt-1">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-orange-800">Priority Support</h5>
                    <p className="text-sm text-orange-700">Get faster consultation booking and premium expert guidance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Sections */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Profile Sections</h4>
            <div className="grid gap-3">
              {PROFILE_SECTIONS.map((section) => {
                const isComplete = getSectionStatus(section.id);
                const Icon = section.icon;
                
                return (
                  <div
                    key={section.id}
                    className={`flex items-center p-3 rounded-lg border transition-colors ${
                      isComplete 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex-shrink-0 mr-3">
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-shrink-0 mr-3">
                      <Icon className={`w-5 h-5 ${isComplete ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isComplete ? 'text-green-900' : 'text-gray-900'}`}>
                        {section.label}
                      </p>
                      <p className={`text-sm ${isComplete ? 'text-green-700' : 'text-gray-600'}`}>
                        {section.description}
                      </p>
                    </div>
                    <Badge variant={isComplete ? 'default' : 'secondary'} className="ml-3">
                      {isComplete ? 'Complete' : 'Pending'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Link href="/profile" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Complete Profile Now
              </Button>
            </Link>
            <Button variant="outline" onClick={onClose} className="px-6">
              Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}