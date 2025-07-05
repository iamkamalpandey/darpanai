import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Heart,
  Star,
  DollarSign,
  Calendar,
  GraduationCap,
  Globe,
  Award,
  BookOpen,
  TrendingUp,
  Sparkles,
  Info,
  Users,
  Target,
  Zap,
  RefreshCw,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface ScholarshipRecommendation {
  id: number;
  scholarshipId: number;
  matchScore: number;
  matchReasons: string[];
  rank: number;
  isActive: boolean;
  createdAt: string;
  // Scholarship details
  scholarshipName: string;
  scholarshipDescription: string;
  targetCountries: string[];
  eligibilityCriteria: string[];
  applicationDeadline: string;
  fundingType: string;
  fundingAmount: string;
  websiteUrl: string;
  // Provider details
  providerName: string;
  providerCountry: string;
}

interface RecommendationStats {
  totalRecommendations: number;
  averageMatchScore: number;
}

export default function ScholarshipRecommendationsNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecommendation, setSelectedRecommendation] = useState<ScholarshipRecommendation | null>(null);

  // Fetch recommendations from stored table
  const { data: recommendationsData, isLoading } = useQuery({
    queryKey: ['/api/scholarship-recommendations'],
    refetchOnWindowFocus: false,
  });

  const recommendations: ScholarshipRecommendation[] = recommendationsData?.recommendations || [];
  const stats: RecommendationStats = recommendationsData?.stats || { totalRecommendations: 0, averageMatchScore: 0 };

  // Regenerate recommendations mutation
  const regenerateRecommendations = useMutation({
    mutationFn: () => apiRequest('POST', '/api/scholarship-recommendations/regenerate'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scholarship-recommendations'] });
      toast({
        title: "Recommendations Updated",
        description: "Your scholarship recommendations have been refreshed based on your current profile.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'Check website for details';
    try {
      const date = new Date(deadline);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return deadline;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Award className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Star className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Target className="w-5 h-5 text-orange-500" />;
    return <Zap className="w-5 h-5 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your personalized recommendations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              Your Scholarship Recommendations
            </h1>
            <p className="mt-2 text-gray-600">
              Personalized scholarship matches based on your academic profile and preferences
            </p>
          </div>
          
          <Button 
            onClick={() => regenerateRecommendations.mutate()}
            disabled={regenerateRecommendations.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${regenerateRecommendations.isPending ? 'animate-spin' : ''}`} />
            Refresh Recommendations
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Recommendations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRecommendations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Match Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageMatchScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-green-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations Grid */}
        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Available</h3>
              <p className="text-gray-600 mb-4">
                Complete your profile to get personalized scholarship recommendations.
              </p>
              <Button 
                onClick={() => regenerateRecommendations.mutate()}
                disabled={regenerateRecommendations.isPending}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${regenerateRecommendations.isPending ? 'animate-spin' : ''}`} />
                Generate Recommendations
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.slice(0, 10).map((rec) => (
              <Card key={rec.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getRankIcon(rec.rank)}
                      <Badge variant="secondary" className="text-xs">
                        #{rec.rank}
                      </Badge>
                    </div>
                    <Badge 
                      className={`text-xs font-semibold border ${getMatchScoreColor(rec.matchScore)}`}
                    >
                      {rec.matchScore}% Match
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight">
                    {rec.scholarshipName}
                  </CardTitle>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {rec.providerName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {rec.providerCountry}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {rec.scholarshipDescription}
                  </p>

                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{rec.fundingAmount || 'Varies'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">{formatDeadline(rec.applicationDeadline)}</span>
                    </div>
                  </div>

                  {/* Target Countries */}
                  {rec.targetCountries && rec.targetCountries.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Target Countries:</p>
                      <div className="flex flex-wrap gap-1">
                        {rec.targetCountries.slice(0, 3).map((country, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                        {rec.targetCountries.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{rec.targetCountries.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Match Reasons */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Why this matches you:</p>
                    <div className="space-y-1">
                      {rec.matchReasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{reason}</span>
                        </div>
                      ))}
                      {rec.matchReasons.length > 2 && (
                        <p className="text-xs text-blue-600 cursor-pointer">
                          +{rec.matchReasons.length - 2} more reasons
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedRecommendation(rec)}
                    >
                      <Info className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    {rec.websiteUrl && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(rec.websiteUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Apply Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Selected Recommendation Details Modal */}
        {selectedRecommendation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">{selectedRecommendation.scholarshipName}</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedRecommendation(null)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-700">{selectedRecommendation.scholarshipDescription}</p>
                  
                  {selectedRecommendation.eligibilityCriteria && selectedRecommendation.eligibilityCriteria.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Eligibility Criteria:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedRecommendation.eligibilityCriteria.map((criteria, idx) => (
                          <li key={idx} className="text-sm text-gray-600">{criteria}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold mb-2">All Match Reasons:</h3>
                    <ul className="space-y-1">
                      {selectedRecommendation.matchReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {selectedRecommendation.websiteUrl && (
                    <Button 
                      className="w-full"
                      onClick={() => window.open(selectedRecommendation.websiteUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Scholarship Website
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}