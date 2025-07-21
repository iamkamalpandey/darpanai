import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Brain, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award, 
  FileText, 
  MessageSquare, 
  Calendar,
  Target,
  Lightbulb,
  CheckCircle,
  Clock,
  Globe,
  DollarSign,
  User
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface UnifiedData {
  studentJourney: {
    currentStage: string;
    completionPercentage: number;
    nextActions: string[];
    milestones: {
      name: string;
      completed: boolean;
      date?: string;
    }[];
  };
  aiInsights: {
    personalizedRecommendations: string[];
    admissionProbability: number;
    scholarshipMatches: number;
    actionableAlerts: string[];
  };
  collaboration: {
    assignedExpert?: {
      name: string;
      specialization: string;
      avatar?: string;
    };
    upcomingConsultations: {
      date: string;
      time: string;
      type: string;
    }[];
    sharedDocuments: number;
    unreadMessages: number;
  };
  analytics: {
    documentsAnalyzed: number;
    applicationsInProgress: number;
    scholarshipsFound: number;
    timeToGoal: string;
  };
}

const JOURNEY_STAGES = [
  { id: 'discovery', name: 'Discovery', icon: Globe, color: 'bg-blue-500' },
  { id: 'profile', name: 'Profile Building', icon: User, color: 'bg-green-500' },
  { id: 'matching', name: 'Smart Matching', icon: Target, color: 'bg-purple-500' },
  { id: 'application', name: 'Application', icon: FileText, color: 'bg-orange-500' },
  { id: 'success', name: 'Success', icon: Award, color: 'bg-gold-500' }
];

export default function UnifiedDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch unified dashboard data
  const { data: unifiedData, isLoading } = useQuery<UnifiedData>({
    queryKey: ['/api/unified-dashboard'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // AI Navigator state
  const [showNavigator, setShowNavigator] = useState(false);
  const [navigatorStep, setNavigatorStep] = useState(0);

  // Quick action mutations
  const scheduleConsultation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/consultations/schedule', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/unified-dashboard'] });
    }
  });

  const getCurrentStageIndex = () => {
    if (!unifiedData?.studentJourney.currentStage) return 0;
    return JOURNEY_STAGES.findIndex(stage => stage.id === unifiedData.studentJourney.currentStage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg text-gray-600">Preparing your intelligent dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Darpan Education</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Unified Intelligence Platform
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNavigator(true)}
                className="hidden sm:flex"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                AI Navigator
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.fieldOfStudy || 'Student'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Journey Progress Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white">Your Study Abroad Journey</CardTitle>
                <CardDescription className="text-blue-100">
                  {unifiedData?.studentJourney.completionPercentage}% Complete • Next: {unifiedData?.studentJourney.nextActions[0]}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  {unifiedData?.studentJourney.completionPercentage}%
                </p>
                <p className="text-sm text-blue-100">Journey Progress</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress 
                value={unifiedData?.studentJourney.completionPercentage || 0} 
                className="h-3 bg-white/20" 
              />
              <div className="flex justify-between items-center">
                {JOURNEY_STAGES.map((stage, index) => {
                  const Icon = stage.icon;
                  const isCompleted = index < getCurrentStageIndex();
                  const isCurrent = index === getCurrentStageIndex();
                  
                  return (
                    <div key={stage.id} className="flex flex-col items-center space-y-2">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${isCompleted ? 'bg-white text-blue-600' : 
                          isCurrent ? 'bg-blue-500 text-white ring-4 ring-white/30' : 
                          'bg-white/20 text-white/60'}
                      `}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className={`text-sm ${isCurrent ? 'font-semibold' : 'font-medium'}`}>
                        {stage.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Intelligent Overview</TabsTrigger>
            <TabsTrigger value="matching">Smart Matching</TabsTrigger>
            <TabsTrigger value="collaboration">Expert Partnership</TabsTrigger>
            <TabsTrigger value="analytics">Success Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* AI Insights Card */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <CardTitle>AI-Powered Insights</CardTitle>
                  </div>
                  <CardDescription>
                    Personalized recommendations based on your unique profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Admission Probability</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {unifiedData?.aiInsights.admissionProbability}%
                      </p>
                      <p className="text-xs text-blue-600">Based on your profile</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Scholarship Matches</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {unifiedData?.aiInsights.scholarshipMatches}
                      </p>
                      <p className="text-xs text-green-600">Active opportunities</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Smart Recommendations</h4>
                    <ul className="space-y-1">
                      {unifiedData?.aiInsights.personalizedRecommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Take your next step</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Expert
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Consultation
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explore Programs
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Action Alerts */}
            {unifiedData?.aiInsights.actionableAlerts && unifiedData.aiInsights.actionableAlerts.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <CardTitle>Action Required</CardTitle>
                  </div>
                  <CardDescription>Important updates and deadlines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {unifiedData.aiInsights.actionableAlerts.map((alert, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                        <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-orange-800">{alert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Smart Matching Tab */}
          <TabsContent value="matching" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>SmartMatch Results</CardTitle>
                  <CardDescription>AI-curated opportunities for you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Intelligent Matching in Progress
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Our AI is analyzing your profile against thousands of programs and scholarships
                    </p>
                    <Button>View Matches</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Probability</CardTitle>
                  <CardDescription>Data-driven admission insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Success Rate</span>
                      <Badge variant="secondary">{unifiedData?.aiInsights.admissionProbability}%</Badge>
                    </div>
                    <Progress value={unifiedData?.aiInsights.admissionProbability} className="h-2" />
                    <p className="text-xs text-gray-500">
                      Based on similar profiles and historical data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Expert Partnership Tab */}
          <TabsContent value="collaboration" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {unifiedData?.collaboration.assignedExpert && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Study Abroad Expert</CardTitle>
                    <CardDescription>Personal guidance from industry professionals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={unifiedData.collaboration.assignedExpert.avatar} />
                        <AvatarFallback>
                          {unifiedData.collaboration.assignedExpert.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {unifiedData.collaboration.assignedExpert.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {unifiedData.collaboration.assignedExpert.specialization}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Collaboration Stats</CardTitle>
                  <CardDescription>Your partnership metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {unifiedData?.collaboration.sharedDocuments || 0}
                        </p>
                        <p className="text-sm text-gray-600">Shared Documents</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {unifiedData?.collaboration.upcomingConsultations.length || 0}
                        </p>
                        <p className="text-sm text-gray-600">Upcoming Sessions</p>
                      </div>
                    </div>
                    {unifiedData?.collaboration.unreadMessages && unifiedData.collaboration.unreadMessages > 0 && (
                      <Badge variant="destructive" className="w-full justify-center">
                        {unifiedData.collaboration.unreadMessages} unread messages
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{unifiedData?.analytics.documentsAnalyzed}</p>
                      <p className="text-sm text-gray-600">Documents Analyzed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{unifiedData?.analytics.applicationsInProgress}</p>
                      <p className="text-sm text-gray-600">Active Applications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{unifiedData?.analytics.scholarshipsFound}</p>
                      <p className="text-sm text-gray-600">Scholarships Found</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{unifiedData?.analytics.timeToGoal}</p>
                      <p className="text-sm text-gray-600">Est. Time to Goal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}