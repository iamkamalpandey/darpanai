import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Trophy, 
  Globe, 
  BookOpen, 
  Users, 
  Heart, 
  Target,
  ArrowRight,
  Clock,
  Star,
  Check,
  RefreshCw,
  Brain,
  ChevronRight,
  Award,
  Calendar,
  MapPin,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

interface Challenge {
  id: string;
  category: 'communication' | 'social' | 'academic' | 'daily_life' | 'professional';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: string;
  points: number;
  country: string;
  scenario: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  culturalTip: string;
  completed: boolean;
  completedAt?: string;
}

interface UserProgress {
  totalPoints: number;
  challengesCompleted: number;
  streakDays: number;
  lastCompletedDate: string;
  categoryProgress: {
    communication: number;
    social: number;
    academic: number;
    daily_life: number;
    professional: number;
  };
}

const categoryColors = {
  communication: 'bg-blue-100 text-blue-800 border-blue-200',
  social: 'bg-purple-100 text-purple-800 border-purple-200',
  academic: 'bg-green-100 text-green-800 border-green-200',
  daily_life: 'bg-orange-100 text-orange-800 border-orange-200',
  professional: 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

const categoryIcons = {
  communication: Users,
  social: Heart,
  academic: BookOpen,
  daily_life: Globe,
  professional: Target
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

export default function CulturalAdaptationChallenges() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Fetch user's cultural adaptation progress
  const { data: userProgress, isLoading: progressLoading } = useQuery<UserProgress>({
    queryKey: ['/api/cultural-adaptation/progress'],
  });

  // Fetch available challenges
  const { data: challenges, isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ['/api/cultural-adaptation/challenges', selectedCategory, selectedDifficulty],
  });

  // Complete challenge mutation
  const completeChallengemutation = useMutation({
    mutationFn: async ({ challengeId, answer }: { challengeId: string; answer: number }) => {
      const res = await apiRequest('POST', '/api/cultural-adaptation/complete', {
        challengeId,
        answer
      });
      return res.json();
    },
    onSuccess: (data) => {
      setShowResult(true);
      queryClient.invalidateQueries({ queryKey: ['/api/cultural-adaptation/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cultural-adaptation/challenges'] });
      
      if (data.correct) {
        toast({
          title: "Correct Answer! 🎉",
          description: `You earned ${data.points} points!`,
        });
      } else {
        toast({
          title: "Learning Opportunity",
          description: "Check the explanation to understand the cultural context better.",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer",
        variant: "destructive",
      });
    },
  });

  // Generate new challenge mutation
  const generateChallengeMutation = useMutation({
    mutationFn: async ({ category, country }: { category: string; country: string }) => {
      const res = await apiRequest('POST', '/api/cultural-adaptation/generate', {
        category,
        country
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cultural-adaptation/challenges'] });
      toast({
        title: "New Challenge Generated!",
        description: "A fresh cultural scenario is ready for you.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate new challenge",
        variant: "destructive",
      });
    },
  });

  const handleAnswerSubmit = () => {
    if (selectedChallenge && userAnswer !== null) {
      completeChallengemutation.mutate({
        challengeId: selectedChallenge.id,
        answer: userAnswer
      });
    }
  };

  const handleNewChallenge = () => {
    setSelectedChallenge(null);
    setUserAnswer(null);
    setShowResult(false);
  };

  const filteredChallenges = challenges?.filter(challenge => {
    const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  }) || [];

  if (progressLoading || challengesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading cultural adaptation challenges...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Cultural Adaptation Challenges
            </h1>
            <p className="text-muted-foreground mt-2">
              Master cultural nuances through interactive scenarios and real-world situations
            </p>
          </div>
          <Button
            onClick={() => generateChallengeMutation.mutate({ category: 'communication', country: 'canada' })}
            disabled={generateChallengeMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generateChallengeMutation.isPending ? 'animate-spin' : ''}`} />
            Generate New Challenge
          </Button>
        </div>

        {/* Progress Overview */}
        {userProgress && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="text-2xl font-bold text-gray-900">{userProgress.totalPoints}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{userProgress.challengesCompleted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Streak Days</p>
                    <p className="text-2xl font-bold text-gray-900">{userProgress.streakDays}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.values(userProgress.categoryProgress).filter(p => p > 0).length}/5
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Progress */}
        {userProgress && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Category Progress
              </CardTitle>
              <CardDescription>
                Track your cultural adaptation skills across different areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(userProgress.categoryProgress).map(([category, progress]) => {
                  const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
                  return (
                    <div key={category} className="flex items-center gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <IconComponent className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Progress value={progress} className="flex-1" />
                        <span className="text-sm text-muted-foreground min-w-0">{progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Challenge Interface */}
        {selectedChallenge ? (
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge className={categoryColors[selectedChallenge.category]}>
                      {selectedChallenge.category.replace('_', ' ')}
                    </Badge>
                    <Badge className={difficultyColors[selectedChallenge.difficulty]}>
                      {selectedChallenge.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {selectedChallenge.country}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{selectedChallenge.timeEstimate}</span>
                  <div className="flex items-center gap-1 ml-4">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{selectedChallenge.points} pts</span>
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl">{selectedChallenge.title}</CardTitle>
              <CardDescription>{selectedChallenge.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scenario */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Cultural Scenario</h4>
                <p className="text-blue-800">{selectedChallenge.scenario}</p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <h4 className="font-semibold">What would be the most appropriate response?</h4>
                {selectedChallenge.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      userAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${showResult && index === selectedChallenge.correctAnswer ? 'border-green-500 bg-green-50' : ''}
                    ${showResult && userAnswer === index && index !== selectedChallenge.correctAnswer ? 'border-red-500 bg-red-50' : ''}`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={index}
                      checked={userAnswer === index}
                      onChange={() => setUserAnswer(index)}
                      disabled={showResult}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      userAnswer === index ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {userAnswer === index && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                    {showResult && index === selectedChallenge.correctAnswer && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </label>
                ))}
              </div>

              {/* Action Buttons */}
              {!showResult ? (
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={userAnswer === null || completeChallengemutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {completeChallengemutation.isPending ? 'Submitting...' : 'Submit Answer'}
                </Button>
              ) : (
                <>
                  {/* Result Explanation */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-2">Explanation</h4>
                      <p className="text-gray-700">{selectedChallenge.explanation}</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">Cultural Tip</h4>
                      <p className="text-purple-800">{selectedChallenge.culturalTip}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleNewChallenge}
                      className="flex-1"
                      variant="outline"
                    >
                      Try Another Challenge
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Challenge Selection */
          <>
            {/* Filters */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Choose Your Challenge</CardTitle>
                <CardDescription>
                  Filter by category and difficulty to find challenges that match your learning goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                    >
                      All Categories
                    </Button>
                    {Object.keys(categoryIcons).map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize"
                      >
                        {category.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDifficulty('all')}
                    >
                      All Levels
                    </Button>
                    {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                      <Button
                        key={difficulty}
                        variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDifficulty(difficulty)}
                        className="capitalize"
                      >
                        {difficulty}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => {
                const IconComponent = categoryIcons[challenge.category];
                return (
                  <Card
                    key={challenge.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={categoryColors[challenge.category]}>
                          {challenge.category.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{challenge.points}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {challenge.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {challenge.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {challenge.country}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {challenge.timeEstimate}
                          </div>
                        </div>
                        <Badge className={difficultyColors[challenge.difficulty]}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Start Challenge
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredChallenges.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Challenges Available</h3>
                  <p className="text-muted-foreground mb-4">
                    No challenges match your current filters. Try adjusting your selection or generate new challenges.
                  </p>
                  <Button
                    onClick={() => generateChallengeMutation.mutate({ category: 'communication', country: 'canada' })}
                    disabled={generateChallengeMutation.isPending}
                  >
                    Generate New Challenges
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}