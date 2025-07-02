import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  Zap, 
  Clock, 
  BookOpen, 
  Award,
  CheckCircle2,
  PlayCircle,
  Star,
  Calendar
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface UserStats {
  id: number;
  userId: string;
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  completedMilestones: number;
  totalMilestones: number;
  lastActivityDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  category: string;
  pointValue: number;
  requiredLevel: number;
  isActive: boolean;
  orderIndex: number;
  estimatedTimeMinutes: number | null;
  createdAt: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  badgeIcon: string;
  badgeType: string;
  rarity: string;
  pointValue: number;
  isSecret: boolean;
  unlockedAt: string;
}

export default function GamifiedLearningPathSimple() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<'milestones' | 'achievements'>('milestones');

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/gamification/stats'],
    retry: false
  });

  // Fetch milestones
  const { data: milestones, isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: ['/api/gamification/milestones'],
    retry: false
  });

  // Fetch achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/gamification/badges'],
    retry: false
  });

  // Complete milestone mutation
  const completeMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: number) => {
      return await apiRequest('POST', `/api/gamification/milestones/${milestoneId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/milestones'] });
    }
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

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return "text-green-600";
    if (streak >= 3) return "text-yellow-600";
    return "text-gray-600";
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'bg-yellow-500';
      case 'epic': return 'bg-purple-500';
      case 'rare': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (statsLoading || milestonesLoading || achievementsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Your Study Abroad Journey
            </h1>
            <p className="text-gray-600 mt-2">
              Complete milestones, earn badges, and track your progress toward studying abroad
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-lg">{userStats?.totalPoints || 0} Points</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Level</p>
                  <p className="text-2xl font-bold text-blue-600">{userStats?.currentLevel || 1}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <Progress value={getLevelProgress(userStats)} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">
                {Math.floor(((userStats?.totalPoints || 0) % 1000))} / 1000 points to next level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Milestones</p>
                  <p className="text-2xl font-bold text-green-600">
                    {userStats?.completedMilestones || 0}/{userStats?.totalMilestones || milestones?.length || 0}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
              <Progress 
                value={userStats?.totalMilestones 
                  ? ((userStats.completedMilestones || 0) / (userStats.totalMilestones || 1)) * 100 
                  : 0
                } 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className={`text-2xl font-bold ${getStreakColor(userStats?.currentStreak || 0)}`}>
                    {userStats?.currentStreak || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Best: {userStats?.longestStreak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Badges Earned</p>
                  <p className="text-2xl font-bold text-purple-600">{achievements?.length || 0}</p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <Button
            variant={selectedTab === 'milestones' ? 'default' : 'ghost'}
            onClick={() => setSelectedTab('milestones')}
            className="mr-2"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Learning Milestones
          </Button>
          <Button
            variant={selectedTab === 'achievements' ? 'default' : 'ghost'}
            onClick={() => setSelectedTab('achievements')}
          >
            <Star className="h-4 w-4 mr-2" />
            Achievements
          </Button>
        </div>

        {/* Content */}
        {selectedTab === 'milestones' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones?.map((milestone) => (
              <Card key={milestone.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{milestone.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {milestone.pointValue} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{milestone.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {milestone.category}
                      </Badge>
                      {milestone.estimatedTimeMinutes && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {milestone.estimatedTimeMinutes}m
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCompleteMilestone(milestone.id)}
                      disabled={completeMilestoneMutation.isPending}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements?.map((achievement) => (
              <Card key={achievement.id} className="text-center">
                <CardContent className="p-4">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${getRarityColor(achievement.rarity)} flex items-center justify-center`}>
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
                  <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {achievement.rarity}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {achievement.pointValue} pts
                    </Badge>
                  </div>
                  {achievement.unlockedAt && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Earned
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty States */}
        {selectedTab === 'milestones' && (!milestones || milestones.length === 0) && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No milestones available</h3>
            <p className="text-gray-600">Check back later for new learning challenges!</p>
          </div>
        )}

        {selectedTab === 'achievements' && (!achievements || achievements.length === 0) && (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements yet</h3>
            <p className="text-gray-600">Complete milestones to earn your first badge!</p>
          </div>
        )}
      </div>
    </div>
  );
}