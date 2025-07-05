import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Heart,
  Star,
  Search,
  DollarSign,
  Calendar,
  GraduationCap,
  Globe,
  Award,
  BookOpen,
  Filter,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';

interface ScholarshipProgram {
  id: number;
  name: string;
  description: string;
  amountDisplay: string;
  deadline: string;
  levelOfStudy: string[];
  needBased: boolean;
  meritBased: boolean;
  tags: string[];
  eligibilitySummary: string[];
  requiredDocuments: string[];
  applicationUrl: string;
  provider: {
    id: number;
    name: string;
    website: string;
  };
}

interface ScholarshipMatch {
  scholarship: ScholarshipProgram;
  matchScore: number;
  matchReasons: string[];
}

interface ApiResponse {
  recommendations?: ScholarshipMatch[];
  scholarships?: ScholarshipMatch[];
  total?: number;
}

export default function ScholarshipHubNew() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipMatch | null>(null);
  const [showSimpleMode, setShowSimpleMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch personalized recommendations
  const { data: recommendationsData, isLoading: isLoadingRecommendations, error: recommendationsError } = useQuery<ApiResponse>({
    queryKey: ['scholarship-recommendations-new'],
    queryFn: () => apiRequest('GET', '/api/scholarships/recommendations'),
    retry: 3,
  });

  // Fetch all scholarships for discovery
  const { data: scholarshipsData, isLoading: isLoadingScholarships } = useQuery<ApiResponse>({
    queryKey: ['scholarships-discovery'],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      return apiRequest('GET', `/api/scholarships?${params.toString()}`);
    },
  });

  // Fetch saved scholarships
  const { data: savedScholarshipsData, isLoading: isLoadingSaved } = useQuery<ApiResponse>({
    queryKey: ['saved-scholarships-new'],
    queryFn: () => apiRequest('GET', '/api/scholarships/user/saved'),
  });

  // Save scholarship mutation
  const saveScholarshipMutation = useMutation({
    mutationFn: (scholarshipId: number) =>
      apiRequest('POST', `/api/scholarships/${scholarshipId}/save`),
    onSuccess: () => {
      toast({ title: 'Scholarship saved successfully!' });
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships-new'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to save scholarship', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Remove scholarship mutation
  const removeScholarshipMutation = useMutation({
    mutationFn: (scholarshipId: number) =>
      apiRequest('DELETE', `/api/scholarships/${scholarshipId}/save`),
    onSuccess: () => {
      toast({ title: 'Scholarship removed successfully!' });
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships-new'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to remove scholarship', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Debug logging
  useEffect(() => {
    console.log('=== SCHOLARSHIP HUB DEBUG ===');
    console.log('Recommendations Data:', recommendationsData);
    console.log('Recommendations Array:', recommendationsData?.recommendations);
    console.log('Recommendations Length:', recommendationsData?.recommendations?.length || 0);
    console.log('Scholarships Data:', scholarshipsData);
    console.log('Saved Data:', savedScholarshipsData);
    console.log('Loading states:', { isLoadingRecommendations, isLoadingScholarships, isLoadingSaved });
    console.log('Error:', recommendationsError);
    console.log('=== END DEBUG ===');
  }, [recommendationsData, scholarshipsData, savedScholarshipsData, isLoadingRecommendations, recommendationsError]);

  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'No deadline specified';
    try {
      const date = new Date(deadline);
      const now = new Date();
      const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 0) return 'Deadline passed';
      if (daysUntil === 0) return 'Due today';
      if (daysUntil === 1) return 'Due tomorrow';
      if (daysUntil <= 30) return `Due in ${daysUntil} days`;
      
      return date.toLocaleDateString();
    } catch {
      return deadline;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const simplifyScholarshipText = (text: string) => {
    if (!showSimpleMode) return text;
    
    // Simplify complex terms for non-technical users
    return text
      .replace(/eligibility criteria/gi, 'who can apply')
      .replace(/merit-based/gi, 'based on grades')
      .replace(/need-based/gi, 'based on financial need')
      .replace(/application deadline/gi, 'last day to apply')
      .replace(/cumulative GPA/gi, 'overall grades')
      .replace(/academic achievement/gi, 'good grades')
      .replace(/extracurricular activities/gi, 'activities outside class');
  };

  const ScholarshipCard = ({ match, showMatchScore = false }: { match: ScholarshipMatch; showMatchScore?: boolean }) => {
    const { scholarship, matchScore, matchReasons } = match;
    const savedScholarshipIds = savedScholarshipsData?.scholarships?.map(s => s.scholarship.id) || [];
    const isSaved = savedScholarshipIds.includes(scholarship.id);

    return (
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                {simplifyScholarshipText(scholarship.name)}
              </CardTitle>
              <p className="text-sm text-gray-600">{scholarship.provider.name}</p>
            </div>
            {showMatchScore && (
              <div className="flex items-center gap-2 ml-4">
                <div className={`w-2 h-2 rounded-full ${getMatchScoreColor(matchScore)}`}></div>
                <span className="text-sm font-medium text-gray-700">{matchScore}% match</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Key Information */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{scholarship.amountDisplay}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{formatDeadline(scholarship.deadline)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{scholarship.levelOfStudy.join(', ')}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {scholarship.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {simplifyScholarshipText(tag)}
              </Badge>
            ))}
            {scholarship.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{scholarship.tags.length - 3} more
              </Badge>
            )}
          </div>

          {/* Match Reasons */}
          {showMatchScore && matchReasons.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                Why this matches you:
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                {matchReasons.slice(0, 2).map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1 h-1 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                    {simplifyScholarshipText(reason)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description Preview */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {simplifyScholarshipText(scholarship.description)}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedScholarship(match)}
              className="flex-1"
            >
              View Details
            </Button>
            {!isSaved ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveScholarshipMutation.mutate(scholarship.id)}
                className="px-3"
                disabled={saveScholarshipMutation.isPending}
              >
                <Heart className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeScholarshipMutation.mutate(scholarship.id)}
                className="px-3 text-red-500 hover:text-red-700"
                disabled={removeScholarshipMutation.isPending}
              >
                <Heart className="w-4 h-4 fill-current" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderScholarshipGrid = (matches: ScholarshipMatch[], showMatchScore = false, emptyMessage = "No scholarships found") => {
    if (!matches || matches.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-2">{emptyMessage}</p>
          <p className="text-gray-500">Try adjusting your search or complete your profile for better matches</p>
        </div>
      );
    }

    return matches.map((match) => (
      <ScholarshipCard key={match.scholarship.id} match={match} showMatchScore={showMatchScore} />
    ));
  };

  // Get actual arrays from API responses
  const recommendations = recommendationsData?.recommendations || [];
  const allScholarships = scholarshipsData?.scholarships || [];
  const savedScholarships = savedScholarshipsData?.scholarships || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Scholarship Hub</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover scholarships tailored to your profile and goals. Find funding for your education journey.
          </p>
          
          {/* Complexity Toggle */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant={showSimpleMode ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSimpleMode(!showSimpleMode)}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {showSimpleMode ? "Simple Mode" : "Switch to Simple Mode"}
            </Button>
            <div className="text-sm text-gray-500 max-w-xs">
              {showSimpleMode ? "Complex terms simplified" : "Simplify scholarship language"}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search scholarships by name, field, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>

        {/* Debug Info for Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Debug Info:</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>Recommendations: {recommendations.length} items</div>
              <div>All Scholarships: {allScholarships.length} items</div>
              <div>Saved: {savedScholarships.length} items</div>
              <div>Loading: R:{isLoadingRecommendations ? 'Y' : 'N'} S:{isLoadingScholarships ? 'Y' : 'N'} Sv:{isLoadingSaved ? 'Y' : 'N'}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              For You ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Discover ({allScholarships.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Saved ({savedScholarships.length})
            </TabsTrigger>
          </TabsList>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Personalized for You</h2>
              </div>
              <p className="text-gray-600">
                {showSimpleMode 
                  ? "Scholarships picked just for you based on your background and goals."
                  : "Based on your profile and preferences, here are scholarships with the highest match potential."
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingRecommendations ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                renderScholarshipGrid(recommendations, true, "No personalized recommendations yet")
              )}
            </div>
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingScholarships ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                renderScholarshipGrid(allScholarships, false, "No scholarships found")
              )}
            </div>
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingSaved ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                renderScholarshipGrid(savedScholarships, false, "No saved scholarships yet")
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Scholarship Detail Modal would go here */}
      {selectedScholarship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {simplifyScholarshipText(selectedScholarship.scholarship.name)}
                </h2>
                <Button variant="ghost" onClick={() => setSelectedScholarship(null)}>
                  ×
                </Button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  {simplifyScholarshipText(selectedScholarship.scholarship.description)}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {showSimpleMode ? "Amount" : "Funding Amount"}
                    </h3>
                    <p className="text-gray-600">{selectedScholarship.scholarship.amountDisplay}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {showSimpleMode ? "Last Day to Apply" : "Deadline"}
                    </h3>
                    <p className="text-gray-600">{formatDeadline(selectedScholarship.scholarship.deadline)}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button asChild className="w-full">
                    <a href={selectedScholarship.scholarship.applicationUrl} target="_blank" rel="noopener noreferrer">
                      Apply Now
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}