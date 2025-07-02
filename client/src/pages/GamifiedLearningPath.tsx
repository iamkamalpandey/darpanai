import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  Star, 
  CheckCircle, 
  Circle, 
  Zap, 
  BookOpen, 
  Award,
  Users,
  TrendingUp,
  Clock,
  Calendar
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/DashboardLayout";

interface LearningPathMilestone {
  id: number;
  title: string;
  description: string;
  category: string;
  orderIndex: number;
  pointsReward: number;
  requiredActivities: string[];
  estimatedHours: number;
  difficulty: string;
  prerequisites: number[] | null;
  resources: any[] | null;
  isCompleted?: boolean;
  completedAt?: string | null;
}

interface UserStats {
  totalPoints: number;
  currentLevel: number;
  completedMilestones: number;
  totalMilestones: number;
  currentStreak: number;
  longestStreak: number;
  earnedBadges: number;
  completedChallenges: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  iconType: string;
  pointsReward: number;
  isUnlocked: boolean;
  unlockedAt?: string | null;
}

export default function GamifiedLearningPath() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("learning-path");

  // Fetch learning path data
  const { data: learningPath, isLoading: pathLoading } = useQuery({
    queryKey: ["/api/gamification/user/learning-path"],
    enabled: !!user,
  });

  // Fetch user progress and stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/gamification/user/progress"],
    enabled: !!user,
  });

  // Fetch user achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/gamification/user/achievements"],
    enabled: !!user,
  });

  // Complete milestone mutation
  const completeMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: number) => {
      return apiRequest("POST", `/api/gamification/user/milestone/${milestoneId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/user/learning-path"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/user/progress"] });
    },
  });

  const handleCompleteMilestone = (milestoneId: number) => {
    completeMilestoneMutation.mutate(milestoneId);
  };

  const getLevelProgress = (stats: UserStats | undefined) => {
    if (!stats) return 0;
    const pointsPerLevel = 1000;
    const currentLevelPoints = stats.totalPoints % pointsPerLevel;
    return (currentLevelPoints / pointsPerLevel) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'application_prep': return <BookOpen className="h-4 w-4" />;
      case 'research': return <Target className="h-4 w-4" />;
      case 'documentation': return <Award className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  if (pathLoading || statsLoading || achievementsLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Study Abroad Journey
            </h1>
            <p className="text-gray-600 mt-2">
              Complete milestones, earn badges, and track your progress toward studying abroad
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-lg">{(userStats as any)?.totalPoints || 0} Points</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Level</p>
                  <p className="text-2xl font-bold text-blue-600">{(userStats as any)?.currentLevel || 1}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <Progress value={getLevelProgress(userStats as any)} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">
                {Math.floor((((userStats as any)?.totalPoints || 0) % 1000))} / 1000 points to next level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Milestones</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(userStats as any)?.completedMilestones || 0}/{(userStats as any)?.totalMilestones || 0}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
              <Progress 
                value={userStats?.totalMilestones ? 
                  ((userStats.completedMilestones / userStats.totalMilestones) * 100) : 0} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-orange-600">{userStats?.currentStreak || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Longest: {userStats?.longestStreak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold text-purple-600">{userStats?.earnedBadges || 0}</p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="leaderboard">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="learning-path" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Your Study Abroad Roadmap
                </CardTitle>
                <p className="text-gray-600">
                  Follow this structured path to successfully apply for studying abroad
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningPath?.milestones?.map((milestone: LearningPathMilestone, index: number) => (
                    <Card key={milestone.id} className={`relative ${milestone.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {milestone.isCompleted ? (
                                <CheckCircle className="h-6 w-6 text-green-500" />
                              ) : (
                                <Circle className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getCategoryIcon(milestone.category)}
                                <h3 className="font-semibold text-lg">{milestone.title}</h3>
                                <Badge className={getDifficultyColor(milestone.difficulty)}>
                                  {milestone.difficulty}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {milestone.pointsReward} pts
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-3">{milestone.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {milestone.estimatedHours}h
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {milestone.category.replace('_', ' ')}
                                </div>
                              </div>

                              {milestone.requiredActivities && milestone.requiredActivities.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Required Activities:</p>
                                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {milestone.requiredActivities.map((activity, idx) => (
                                      <li key={idx}>{activity}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 ml-4">
                            {!milestone.isCompleted && (
                              <Button
                                onClick={() => handleCompleteMilestone(milestone.id)}
                                disabled={completeMilestoneMutation.isPending}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                              >
                                {completeMilestoneMutation.isPending ? "Completing..." : "Mark Complete"}
                              </Button>
                            )}
                            {milestone.isCompleted && milestone.completedAt && (
                              <div className="text-right">
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Completed
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(milestone.completedAt).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Achievements
                </CardTitle>
                <p className="text-gray-600">
                  Unlock badges and achievements as you progress through your study abroad journey
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements?.map((achievement: Achievement) => (
                    <Card key={achievement.id} className={`relative ${achievement.isUnlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                      <CardContent className="p-4 text-center">
                        <div className="flex justify-center mb-3">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${achievement.isUnlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-300'}`}>
                            <Trophy className={`h-8 w-8 ${achievement.isUnlocked ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                        </div>
                        <h3 className="font-semibold mb-2">{achievement.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                        <div className="flex items-center justify-center gap-2">
                          <Badge className={achievement.isUnlocked ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}>
                            <Star className="h-3 w-3 mr-1" />
                            {achievement.pointsReward} pts
                          </Badge>
                        </div>
                        {achievement.isUnlocked && achievement.unlockedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Leaderboard
                </CardTitle>
                <p className="text-gray-600">
                  See how you rank among other students in the EduCounsel community
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Coming Soon</h3>
                  <p className="text-gray-500">
                    The community leaderboard will be available soon. Keep completing milestones to build your ranking!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}