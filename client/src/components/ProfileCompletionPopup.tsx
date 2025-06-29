import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Link } from 'wouter';
import { 
  User,
  X,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Star,
  ArrowRight,
  Brain,
  Target,
  Shield
} from 'lucide-react';

interface ProfileCompletionData {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  completedSections: string[];
  pendingSections: string[];
}

interface ProfileCompletionPopupProps {
  profileData: ProfileCompletionData;
  onDismiss: () => void;
}

export function ProfileCompletionPopup({ profileData, onDismiss }: ProfileCompletionPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup only if profile is not 100% complete
    if (!profileData.isComplete && profileData.completionPercentage < 100) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500); // Show after 1.5 seconds
      return () => clearTimeout(timer);
    }
  }, [profileData.isComplete, profileData.completionPercentage]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300); // Allow animation to complete
  };

  if (!isVisible || profileData.isComplete || profileData.completionPercentage >= 100) {
    return null;
  }

  const getCompletionMessage = () => {
    if (profileData.completionPercentage >= 80) {
      return "You're almost there! Complete your profile for enhanced AI precision.";
    } else if (profileData.completionPercentage >= 50) {
      return "Halfway done! Complete your profile to unlock full AI capabilities.";
    } else {
      return "Complete your profile to receive genuine, personalized AI reports.";
    }
  };

  const getCompletionColor = () => {
    if (profileData.completionPercentage >= 80) return "text-green-600";
    if (profileData.completionPercentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getBadgeVariant = () => {
    if (profileData.completionPercentage >= 80) return "default";
    if (profileData.completionPercentage >= 50) return "secondary";
    return "destructive";
  };

  const getProgressColor = () => {
    if (profileData.completionPercentage >= 80) return "bg-green-500";
    if (profileData.completionPercentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <>
      {/* Backdrop with animation */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <Card className="w-full max-w-lg shadow-2xl border-0 animate-in slide-in-from-bottom-5 duration-500">
          <CardHeader className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900">
                  Enhance Your AI Experience
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Complete your profile for genuine, personalized reports
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Completion Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <Badge variant={getBadgeVariant()} className="font-semibold">
                  {profileData.completionPercentage}%
                </Badge>
              </div>
              
              <Progress value={profileData.completionPercentage} className="h-3 mb-2" />
              
              <p className={`text-sm font-medium ${getCompletionColor()}`}>
                {getCompletionMessage()}
              </p>
            </div>

            {/* Benefits Section */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                Why Complete Your Profile?
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Personalized Recommendations</p>
                    <p className="text-xs text-gray-600">AI analyzes your background for tailored suggestions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Enhanced Accuracy</p>
                    <p className="text-xs text-gray-600">Complete data ensures more precise analysis</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Star className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Better Matching</p>
                    <p className="text-xs text-gray-600">Find opportunities that truly fit your profile</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Missing Sections */}
            {profileData.pendingSections.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  Complete These Sections:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profileData.pendingSections.slice(0, 4).map((section, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {section}
                    </Badge>
                  ))}
                  {profileData.pendingSections.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{profileData.pendingSections.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1 text-gray-600 hover:text-gray-800"
              >
                Maybe Later
              </Button>
              
              <Link href="/profile" className="flex-1">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                  onClick={handleDismiss}
                >
                  Complete Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Trust Indicator */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                Your data is secure and used only for personalized recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}