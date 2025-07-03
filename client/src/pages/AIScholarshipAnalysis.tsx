import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Search, Filter, Star, MapPin, Calendar, DollarSign, GraduationCap, 
  Award, Globe, Users, Clock, BookOpen, TrendingUp, Heart, ExternalLink,
  ChevronDown, ChevronUp, Target, Lightbulb, CheckCircle, Brain, Sparkles,
  AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

interface ScholarshipMatch {
  scholarship: any;
  matchScore: number;
  matchReasons: string[];
  aiInsights: string[];
  recommendationStrength: 'excellent' | 'good' | 'fair' | 'consider';
  actionItems: string[];
}

interface AIAnalysisResponse {
  matches: ScholarshipMatch[];
  personalizedSummary: string;
  overallRecommendations: string[];
  nextSteps: string[];
}

export default function AIScholarshipAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<ScholarshipMatch | null>(null);
  const [preferences, setPreferences] = useState({
    preferredCountries: [] as string[],
    fieldOfStudy: '',
    studyLevel: '',
    budgetRange: '',
    targetDegree: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AIAnalysisResponse | null>(null);

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/user'],
    enabled: !!user
  });

  // AI Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (criteria: any): Promise<AIAnalysisResponse> => {
      const response = await apiRequest('POST', '/api/scholarship-ai/analyze', criteria);
      return response as unknown as AIAnalysisResponse;
    },
    onSuccess: (data: AIAnalysisResponse) => {
      setAnalysisData(data);
      setIsAnalyzing(false);
      toast({
        title: "AI Analysis Complete",
        description: `Found ${data.matches.length} scholarship matches with AI insights`,
        variant: "default"
      });
    },
    onError: (error: any) => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze scholarships",
        variant: "destructive"
      });
    }
  });

  // Quick match mutation (uses profile automatically)
  const quickMatchMutation = useMutation({
    mutationFn: async (): Promise<AIAnalysisResponse> => {
      const response = await apiRequest('POST', '/api/scholarship-ai/quick-match', {});
      return response as unknown as AIAnalysisResponse;
    },
    onSuccess: (data: AIAnalysisResponse) => {
      setAnalysisData(data);
      toast({
        title: "Quick Analysis Complete",
        description: `AI found ${data.matches.length} personalized matches`,
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Quick Analysis Failed", 
        description: error.message || "Failed to generate quick matches",
        variant: "destructive"
      });
    }
  });

  // Save to watchlist mutation
  const saveToWatchlistMutation = useMutation({
    mutationFn: async (data: { scholarshipId: number; scholarshipName: string }) => {
      const response = await apiRequest('POST', '/api/scholarship-ai/watchlist/save', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Saved to Watchlist",
        description: "Scholarship saved to your watchlist successfully",
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save scholarship",
        variant: "destructive"
      });
    }
  });

  // Create inquiry mutation
  const createInquiryMutation = useMutation({
    mutationFn: async (data: { scholarshipId: number; scholarshipName: string; message?: string }) => {
      const response = await apiRequest('POST', '/api/scholarship-ai/inquiry/create', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Submitted",
        description: "Your inquiry has been submitted for admin review",
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Inquiry Failed",
        description: error.message || "Failed to submit inquiry", 
        variant: "destructive"
      });
    }
  });

  const handleAnalyze = () => {
    if (!userProfile) {
      toast({
        title: "Profile Required",
        description: "Please complete your profile first",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    const criteria = {
      userId: user?.id,
      userProfile,
      preferences
    };
    analysisMutation.mutate(criteria);
  };

  const handleQuickMatch = () => {
    if (!userProfile) {
      toast({
        title: "Profile Required", 
        description: "Please complete your profile first",
        variant: "destructive"
      });
      return;
    }
    quickMatchMutation.mutate();
  };

  const handleSaveToWatchlist = (scholarship: any) => {
    saveToWatchlistMutation.mutate({
      scholarshipId: scholarship.id,
      scholarshipName: scholarship.name
    });
  };

  const handleKnowMore = (scholarship: any) => {
    createInquiryMutation.mutate({
      scholarshipId: scholarship.id,
      scholarshipName: scholarship.name,
      message: `I would like to know more about the ${scholarship.name} scholarship opportunity.`
    });
  };

  const getMatchColor = (strength: string) => {
    switch (strength) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getMatchIcon = (strength: string) => {
    switch (strength) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <Target className="w-4 h-4" />;
      case 'fair': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">AI Scholarship Analysis</h1>
              <p className="text-blue-100">Powered by DeepSeek AI with OpenAI fallback</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Button 
              onClick={handleQuickMatch}
              disabled={quickMatchMutation.isPending}
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              {quickMatchMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Quick AI Match (Use My Profile)
            </Button>
            
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || analysisMutation.isPending}
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              {(isAnalyzing || analysisMutation.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              Custom AI Analysis
            </Button>
          </div>
        </div>

        {/* User Profile Summary */}
        {userProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Academic Level</Label>
                  <p className="font-medium">{(userProfile as any)?.studyLevel || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Field of Study</Label>
                  <p className="font-medium">{(userProfile as any)?.fieldOfStudy || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Preferred Countries</Label>
                  <p className="font-medium">
                    {(userProfile as any)?.preferredCountries?.length > 0 
                      ? (userProfile as any).preferredCountries.join(', ')
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Preferences (for custom analysis) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Custom Analysis Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field">Field of Study</Label>
                <Input
                  id="field"
                  value={preferences.fieldOfStudy}
                  onChange={(e) => setPreferences(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="level">Study Level</Label>
                <Select 
                  value={preferences.studyLevel} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, studyLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                    <SelectItem value="Master's">Master's</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="budget">Budget Range</Label>
              <Select 
                value={preferences.budgetRange} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, budgetRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Under $25,000">Under $25,000</SelectItem>
                  <SelectItem value="$25,000 - $50,000">$25,000 - $50,000</SelectItem>
                  <SelectItem value="$50,000 - $100,000">$50,000 - $100,000</SelectItem>
                  <SelectItem value="Above $100,000">Above $100,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Results */}
        {analysisData && (
          <div className="space-y-6">
            {/* AI Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  AI Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800">{analysisData.personalizedSummary}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Overall Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {analysisData.overallRecommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Next Steps
                    </h4>
                    <ul className="space-y-1">
                      {analysisData.nextSteps.map((step, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <Clock className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scholarship Matches */}
            <div className="grid gap-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                AI-Matched Scholarships ({analysisData.matches.length})
              </h2>
              
              {analysisData.matches.map((match, index) => (
                <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{match.scholarship.name}</CardTitle>
                        <p className="text-gray-600">{match.scholarship.provider}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getMatchColor(match.recommendationStrength)} mb-2`}>
                          {getMatchIcon(match.recommendationStrength)}
                          <span className="ml-1 capitalize">{match.recommendationStrength}</span>
                        </Badge>
                        <div className="text-2xl font-bold text-blue-600">
                          {match.matchScore}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                        <TabsTrigger value="match-reasons">Match Reasons</TabsTrigger>
                        <TabsTrigger value="action-items">Action Items</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{match.scholarship.country || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span>{match.scholarship.fundingAmount || 'Amount varies'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{match.scholarship.applicationDeadline || 'Check website'}</span>
                          </div>
                        </div>
                        <p className="text-gray-700">{match.scholarship.description}</p>
                      </TabsContent>
                      
                      <TabsContent value="ai-insights" className="space-y-3">
                        {match.aiInsights && Array.isArray(match.aiInsights) ? match.aiInsights.map((insight, idx) => (
                          <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <p className="text-purple-800">{String(insight)}</p>
                          </div>
                        )) : (
                          <p className="text-gray-500">No AI insights available</p>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="match-reasons" className="space-y-2">
                        {match.matchReasons.map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{reason}</span>
                          </div>
                        ))}
                      </TabsContent>
                      
                      <TabsContent value="action-items" className="space-y-2">
                        {match.actionItems.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleSaveToWatchlist(match.scholarship)}
                        disabled={saveToWatchlistMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        {saveToWatchlistMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Heart className="w-4 h-4 mr-2" />
                        )}
                        Save to Watchlist
                      </Button>
                      
                      <Button 
                        onClick={() => handleKnowMore(match.scholarship)}
                        disabled={createInquiryMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        {createInquiryMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        Know More
                      </Button>
                      
                      {match.scholarship.website && (
                        <Button asChild variant="outline" size="sm">
                          <a href={match.scholarship.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4 mr-2" />
                            Visit Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results State */}
        {analysisData && analysisData.matches.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
              <p className="text-gray-600 mb-4">
                The AI couldn't find scholarships matching your current criteria. 
                Try adjusting your preferences or complete your profile.
              </p>
              <Button onClick={() => setAnalysisData(null)} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Different Criteria
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action (when no analysis yet) */}
        {!analysisData && (
          <Card>
            <CardContent className="text-center py-8">
              <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready for AI Analysis?</h3>
              <p className="text-gray-600 mb-4">
                Get personalized scholarship recommendations powered by advanced AI analysis of your profile and preferences.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleQuickMatch} disabled={quickMatchMutation.isPending}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Quick Match
                </Button>
                <Button onClick={handleAnalyze} variant="outline" disabled={isAnalyzing || analysisMutation.isPending}>
                  <Brain className="w-4 h-4 mr-2" />
                  Custom Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}