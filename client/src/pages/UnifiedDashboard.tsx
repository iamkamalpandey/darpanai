import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { 
  BookOpen, 
  TrendingUp, 
  Award, 
  FileText, 
  MessageSquare, 
  Calendar,
  Target,
  CheckCircle,
  Clock,
  Globe,
  ArrowRight,
  BarChart3,
  GraduationCap,
  Briefcase,
  Users,
  Brain
} from 'lucide-react';

interface UnifiedData {
  studentJourney: {
    currentStage: string;
    completionPercentage: number;
    nextActions: string[];
  };
  analytics: {
    documentsAnalyzed: number;
    applicationsInProgress: number;
    scholarshipsFound: number;
    timeToGoal: string;
  };
  aiInsights: {
    personalizedRecommendations: string[];
    scholarshipMatches: number;
  };
}

export default function UnifiedDashboard() {
  const { user } = useAuth();

  // Fetch unified dashboard data
  const { data: unifiedData, isLoading } = useQuery<UnifiedData>({
    queryKey: ['/api/unified-dashboard'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || user?.username}
          </h1>
          <p className="text-gray-600 mt-1">
            Continue your international education journey
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Journey Completion</span>
              <span className="text-sm font-medium">
                {unifiedData?.studentJourney.completionPercentage || 0}%
              </span>
            </div>
            <Progress value={unifiedData?.studentJourney.completionPercentage || 0} className="h-2" />
            
            {/* Next Steps */}
            {unifiedData?.studentJourney.nextActions && unifiedData.studentJourney.nextActions.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Next Steps</h4>
                <div className="space-y-2">
                  {unifiedData.studentJourney.nextActions.slice(0, 3).map((action, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {unifiedData?.analytics.documentsAnalyzed || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {unifiedData?.analytics.applicationsInProgress || 0}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scholarships</p>
                <p className="text-2xl font-bold text-gray-900">
                  {unifiedData?.analytics.scholarshipsFound || 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time to Goal</p>
                <p className="text-lg font-bold text-gray-900">
                  {unifiedData?.analytics.timeToGoal || 'N/A'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {unifiedData?.aiInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {unifiedData.aiInsights.scholarshipMatches || 0}
                  </div>
                  <div className="text-sm text-gray-600">Scholarship Matches</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Personalized Recommendations</h4>
                <div className="space-y-2">
                  {unifiedData.aiInsights.personalizedRecommendations?.slice(0, 3).map((rec, index) => (
                    <div key={index} className="flex items-start text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/visa-analysis">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Analyze Documents</h3>
                  <p className="text-sm text-gray-600">AI-powered document analysis</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/consultations">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Book Consultation</h3>
                  <p className="text-sm text-gray-600">Expert guidance sessions</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/scholarship-research">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Find Scholarships</h3>
                  <p className="text-sm text-gray-600">Discover funding opportunities</p>
                </div>
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ai-study-destination">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Study Destinations</h3>
                  <p className="text-sm text-gray-600">Find your ideal study location</p>
                </div>
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/simple-assessment">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Assessment</h3>
                  <p className="text-sm text-gray-600">Evaluate your profile</p>
                </div>
                <BarChart3 className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/educounsel-ai">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">AI Counselor</h3>
                  <p className="text-sm text-gray-600">Get instant guidance</p>
                </div>
                <MessageSquare className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}