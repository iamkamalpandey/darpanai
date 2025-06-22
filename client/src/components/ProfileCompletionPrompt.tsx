import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Link } from 'wouter';
import { 
  User,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Star,
  ArrowRight
} from 'lucide-react';

interface ProfileCompletionData {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  completedSections: string[];
  pendingSections: string[];
}

interface ProfileCompletionPromptProps {
  profileData: ProfileCompletionData;
  onDismiss: () => void;
}

export function ProfileCompletionPrompt({ profileData, onDismiss }: ProfileCompletionPromptProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup only if profile is not 100% complete
    if (!profileData.isComplete && profileData.completionPercentage < 100) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000); // Show after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [profileData.isComplete, profileData.completionPercentage]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible || profileData.isComplete || profileData.completionPercentage >= 100) {
    return null;
  }

  const getCompletionMessage = () => {
    if (profileData.completionPercentage >= 80) {
      return "You're almost there! Complete your profile for better AI matching.";
    } else if (profileData.completionPercentage >= 50) {
      return "Halfway done! Complete your profile to unlock full AI capabilities.";
    } else {
      return "Complete your profile to get personalized AI recommendations.";
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

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="relative">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-xl">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Complete Your Profile</CardTitle>
                <CardDescription>Unlock AI-powered recommendations</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Section */}
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getCompletionColor()}`}>
                {Math.round(profileData.completionPercentage)}%
              </div>
              <p className="text-gray-600 mb-4">{getCompletionMessage()}</p>
              <Progress value={profileData.completionPercentage} className="h-3 mb-2" />
              <Badge variant={getBadgeVariant()} className="px-3 py-1">
                {profileData.completionPercentage >= 80 ? "Almost Complete" : 
                 profileData.completionPercentage >= 50 ? "In Progress" : "Getting Started"}
              </Badge>
            </div>

            {/* Benefits Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 mb-3">Complete profile unlocks:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Better AI analysis accuracy</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Personalized scholarship matching</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Success probability predictions</span>
                </div>
              </div>
            </div>

            {/* Missing Sections */}
            {profileData.pendingSections && profileData.pendingSections.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm">Pending sections:</h4>
                <div className="flex flex-wrap gap-2">
                  {profileData.pendingSections.slice(0, 3).map((section, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {section}
                    </Badge>
                  ))}
                  {profileData.pendingSections.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profileData.pendingSections.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link href="/profile" className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Complete Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDismiss} className="px-4">
                Later
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center">
              Takes 2-3 minutes to complete • Improves AI accuracy by up to 40%
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}