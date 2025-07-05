import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  Star, 
  Flame, 
  BookOpen, 
  Award,
  TrendingUp,
  Zap,
  Heart,
  Crown,
  Sparkles,
  Gift,
  CheckCircle,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GamificationStats {
  points: number;
  level: number;
  currentStreak: number;
  maxStreak: number;
  scholarshipsViewed: number;
  scholarshipsSaved: number;
  achievements: any[];
  milestones: any[];
  nextMilestone?: any;
  levelProgress: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  pointsRequired: number;
  condition: string;
  rarity: string;
  isActive: boolean;
}

interface Milestone {
  id: number;
  name: string;
  description: string;
  icon: string;
  order: number;
  pointsRequired: number;
  isActive: boolean;
}

const GamifiedProgress: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRewards, setShowRewards] = useState(false);

  // Fetch gamification stats
  const { data: stats, isLoading } = useQuery<GamificationStats>({
    queryKey: ['/api/gamification/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch all achievements
  const { data: allAchievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/gamification/achievements'],
  });

  // Fetch all milestones
  const { data: allMilestones = [] } = useQuery<Milestone[]>({
    queryKey: ['/api/gamification/milestones'],
  });

  // Initialize gamification system
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/gamification/initialize', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to initialize gamification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gamification'] });
      toast({
        title: "Welcome to your scholarship journey!",
        description: "Your progress tracking has been initialized. Start exploring to earn points!",
      });
    },
  });

  // Initialize on component mount if no stats exist
  useEffect(() => {
    if (!isLoading && !stats) {
      initializeMutation.mutate();
    }
  }, [isLoading, stats]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'uncommon': return 'bg-green-100 text-green-800 border-green-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="w-4 h-4" />;
      case 'uncommon': return <Award className="w-4 h-4" />;
      case 'rare': return <Crown className="w-4 h-4" />;
      case 'epic': return <Sparkles className="w-4 h-4" />;
      case 'legendary': return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getAchievementProgress = (achievement: Achievement) => {
    if (!stats) return 0;
    
    switch (achievement.condition) {
      case 'viewed_5_scholarships':
        return Math.min(100, (stats.scholarshipsViewed / 5) * 100);
      case 'viewed_10_scholarships':
        return Math.min(100, (stats.scholarshipsViewed / 10) * 100);
      case 'viewed_25_scholarships':
        return Math.min(100, (stats.scholarshipsViewed / 25) * 100);
      case 'saved_3_scholarships':
        return Math.min(100, (stats.scholarshipsSaved / 3) * 100);
      case 'saved_5_scholarships':
        return Math.min(100, (stats.scholarshipsSaved / 5) * 100);
      case 'saved_10_scholarships':
        return Math.min(100, (stats.scholarshipsSaved / 10) * 100);
      case 'reached_level_5':
        return Math.min(100, (stats.level / 5) * 100);
      case 'reached_level_10':
        return Math.min(100, (stats.level / 10) * 100);
      case 'streak_7_days':
        return Math.min(100, (stats.currentStreak / 7) * 100);
      case 'streak_30_days':
        return Math.min(100, (stats.currentStreak / 30) * 100);
      default:
        return 0;
    }
  };

  const isAchievementUnlocked = (achievement: Achievement) => {
    return stats?.achievements.some(a => a.achievementId === achievement.id) || false;
  };

  const isMilestoneCompleted = (milestone: Milestone) => {
    return stats?.milestones.some(m => m.milestoneId === milestone.id) || false;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Tracker</h1>
          <p className="text-gray-600 mt-1">Track your scholarship discovery journey</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Zap className="w-4 h-4 mr-1" />
            {stats?.points || 0} Points
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Star className="w-4 h-4 mr-1" />
            Level {stats?.level || 1}
          </Badge>
        </div>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Current Level</p>
                <p className="text-2xl font-bold text-blue-900">{stats?.level || 1}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-blue-600">
                <span>Progress to next level</span>
                <span>{Math.round(stats?.levelProgress || 0)}%</span>
              </div>
              <Progress value={stats?.levelProgress || 0} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Current Streak</p>
                <p className="text-2xl font-bold text-orange-900">{stats?.currentStreak || 0} days</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-orange-600 mt-2">
              Max: {stats?.maxStreak || 0} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Scholarships Viewed</p>
                <p className="text-2xl font-bold text-green-900">{stats?.scholarshipsViewed || 0}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Scholarships Saved</p>
                <p className="text-2xl font-bold text-purple-900">{stats?.scholarshipsSaved || 0}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Milestone */}
      {stats?.nextMilestone && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Next Milestone</h3>
                  <p className="text-indigo-600 font-medium">{stats.nextMilestone.name}</p>
                  <p className="text-sm text-gray-600">{stats.nextMilestone.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.nextMilestone.pointsRequired - stats.points}
                </p>
                <p className="text-xs text-gray-600">points to go</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={(stats.points / stats.nextMilestone.pointsRequired) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Achievements and Milestones */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements" className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Milestones</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allAchievements.map((achievement) => {
              const isUnlocked = isAchievementUnlocked(achievement);
              const progress = getAchievementProgress(achievement);
              
              return (
                <Card 
                  key={achievement.id} 
                  className={`${isUnlocked ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' : 'bg-gray-50 border-gray-200'} transition-all duration-200 hover:shadow-md`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{achievement.icon}</span>
                        {isUnlocked && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {!isUnlocked && <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRarityColor(achievement.rarity)}`}
                      >
                        {getRarityIcon(achievement.rarity)}
                        <span className="ml-1 capitalize">{achievement.rarity}</span>
                      </Badge>
                    </div>
                    
                    <h3 className={`font-semibold mb-1 ${isUnlocked ? 'text-yellow-900' : 'text-gray-700'}`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-sm mb-3 ${isUnlocked ? 'text-yellow-700' : 'text-gray-600'}`}>
                      {achievement.description}
                    </p>
                    
                    {!isUnlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-gray-700">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="space-y-4">
            {allMilestones.map((milestone, index) => {
              const isCompleted = isMilestoneCompleted(milestone);
              const isAccessible = stats ? stats.points >= milestone.pointsRequired : false;
              
              return (
                <Card 
                  key={milestone.id} 
                  className={`${isCompleted ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' : isAccessible ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100' : isAccessible ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <span className="text-2xl">{milestone.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className={`font-semibold ${isCompleted ? 'text-green-900' : isAccessible ? 'text-blue-900' : 'text-gray-700'}`}>
                              {milestone.name}
                            </h3>
                            {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                          </div>
                          <p className={`text-sm ${isCompleted ? 'text-green-700' : isAccessible ? 'text-blue-700' : 'text-gray-600'}`}>
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isCompleted ? 'text-green-600' : isAccessible ? 'text-blue-600' : 'text-gray-500'}`}>
                          {milestone.pointsRequired}
                        </p>
                        <p className="text-xs text-gray-500">points required</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6 text-center">
          <Gift className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-xl font-semibold mb-2">Keep Exploring!</h3>
          <p className="text-blue-100 mb-4">
            Continue discovering scholarship opportunities to unlock achievements and reach new milestones.
          </p>
          <Button 
            onClick={() => window.location.href = '/scholarship-recommendations'}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Explore Scholarships
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamifiedProgress;