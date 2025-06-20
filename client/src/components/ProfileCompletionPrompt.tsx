import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, User, GraduationCap, Globe, DollarSign, MapPin, Briefcase, Languages, X } from 'lucide-react';
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
  const { data: completionStatus } = useQuery({
    queryKey: ['/api/user/profile-completion'],
  }) as { data: any };

  const completionPercentage = completionStatus?.completionPercentage || 0;
  const missingFields = completionStatus?.missingFields || [];

  const getSectionStatus = (sectionId: string) => {
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
    const missingSectionFields = sectionFields.filter(field => missingFields.includes(field));
    return missingSectionFields.length === 0;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Complete Your Profile for Better AI Analysis
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
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

          {/* Benefits Section */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Why Complete Your Profile?</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Get personalized AI study destination recommendations</li>
              <li>• Receive more accurate document analysis results</li>
              <li>• Access scholarship matching based on your profile</li>
              <li>• Get country-specific visa guidance tailored to you</li>
              <li>• Unlock advanced features and priority support</li>
            </ul>
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