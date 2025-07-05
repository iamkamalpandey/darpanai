import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Heart, 
  Calendar, 
  DollarSign, 
  GraduationCap,
  Sparkles,
  BookOpen,
  TrendingUp,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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

const ScholarshipHub: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    needBased: false,
    meritBased: false,
    levelOfStudy: [] as string[],
    tags: [] as string[],
  });
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipMatch | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch scholarships with search and filters
  const { data: scholarshipsData, isLoading: isLoadingScholarships } = useQuery({
    queryKey: ['scholarships', searchQuery, selectedFilters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedFilters.needBased) params.append('needBased', 'true');
      if (selectedFilters.meritBased) params.append('meritBased', 'true');
      if (selectedFilters.levelOfStudy.length) params.append('levelOfStudy', selectedFilters.levelOfStudy.join(','));
      if (selectedFilters.tags.length) params.append('tags', selectedFilters.tags.join(','));
      
      return apiRequest('GET', `/api/scholarships?${params.toString()}`);
    },
  });

  // Fetch personalized recommendations
  const { data: recommendationsData, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['scholarship-recommendations'],
    queryFn: () => apiRequest('GET', '/api/scholarships/recommendations'),
  });

  // Fetch saved scholarships
  const { data: savedScholarshipsData, isLoading: isLoadingSaved } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: () => apiRequest('GET', '/api/scholarships/user/saved'),
  });

  // Fetch user preferences
  const { data: preferencesData } = useQuery({
    queryKey: ['scholarship-preferences'],
    queryFn: () => apiRequest('GET', '/api/scholarships/user/preferences'),
  });

  // Save scholarship mutation
  const saveScholarshipMutation = useMutation({
    mutationFn: (scholarshipId: number) => 
      apiRequest('POST', `/api/scholarships/${scholarshipId}/save`, { status: 'saved' }),
    onSuccess: () => {
      toast({ title: 'Scholarship saved successfully!' });
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] });
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
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to remove scholarship', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleSaveScholarship = (scholarshipId: number) => {
    saveScholarshipMutation.mutate(scholarshipId);
  };

  const handleRemoveScholarship = (scholarshipId: number) => {
    removeScholarshipMutation.mutate(scholarshipId);
  };

  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'No deadline specified';
    const date = new Date(deadline);
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return 'Deadline passed';
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    if (daysUntil <= 30) return `Due in ${daysUntil} days`;
    
    return date.toLocaleDateString();
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const ScholarshipCard: React.FC<{ 
    match: ScholarshipMatch; 
    isSaved?: boolean;
    showMatchScore?: boolean;
  }> = ({ match, isSaved = false, showMatchScore = true }) => {
    const { scholarship, matchScore, matchReasons } = match;

    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedScholarship(match)}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                {scholarship.name}
              </CardTitle>
              <p className="text-sm text-gray-600 mb-2">{scholarship.provider.name}</p>
            </div>
            {showMatchScore && (
              <div className="flex flex-col items-center ml-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${getMatchScoreColor(matchScore)}`}>
                  {matchScore}%
                </div>
                <span className="text-xs text-gray-500 mt-1">Match</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Key Information */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-1" />
              {scholarship.amountDisplay}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDeadline(scholarship.deadline)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 mr-1" />
              {scholarship.levelOfStudy.join(', ')}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {scholarship.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
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
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Why it's a match:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {matchReasons.slice(0, 2).map((reason, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description Preview */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {scholarship.description}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedScholarship(match);
              }}
              className="flex-1"
            >
              View Details
            </Button>
            {!isSaved ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveScholarship(scholarship.id);
                }}
                className="px-3"
                disabled={saveScholarshipMutation.isPending}
              >
                <Heart className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveScholarship(scholarship.id);
                }}
                className="px-3 text-red-600"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scholarship Hub</h1>
              <p className="text-gray-600">AI-powered scholarship matching and discovery</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search scholarships by field, provider, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              For You
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

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
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : scholarshipsData?.scholarships?.length > 0 ? (
                scholarshipsData.scholarships.map((match: ScholarshipMatch) => (
                  <ScholarshipCard key={match.scholarship.id} match={match} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">No scholarships found</p>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Personalized for You</h2>
              </div>
              <p className="text-gray-600">
                Based on your profile and preferences, here are scholarships with the highest match potential.
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
              ) : recommendationsData?.recommendations?.length > 0 ? (
                recommendationsData.recommendations.map((match: ScholarshipMatch) => (
                  <ScholarshipCard key={match.scholarship.id} match={match} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">No recommendations yet</p>
                  <p className="text-gray-500">Complete your profile preferences to get personalized recommendations</p>
                </div>
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
              ) : savedScholarshipsData?.scholarships?.length > 0 ? (
                savedScholarshipsData.scholarships.map((match: ScholarshipMatch) => (
                  <ScholarshipCard 
                    key={match.scholarship.id} 
                    match={match} 
                    isSaved={true}
                    showMatchScore={false}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">No saved scholarships</p>
                  <p className="text-gray-500">Save scholarships from the Discover tab to keep track of them</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scholarship Preferences</CardTitle>
                <p className="text-gray-600">
                  Set your preferences to get better scholarship matches and recommendations.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Preferences Coming Soon</p>
                  <p className="text-gray-500">
                    We're building an enhanced preferences system for better scholarship matching.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Scholarship Detail Modal/Sidebar would go here */}
      {selectedScholarship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedScholarship.scholarship.name}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedScholarship(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">{selectedScholarship.scholarship.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Amount:</span> {selectedScholarship.scholarship.amountDisplay}
                  </div>
                  <div>
                    <span className="font-medium">Deadline:</span> {formatDeadline(selectedScholarship.scholarship.deadline)}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Eligibility Requirements:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {selectedScholarship.scholarship.eligibilitySummary.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Required Documents:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {selectedScholarship.scholarship.requiredDocuments.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => window.open(selectedScholarship.scholarship.applicationUrl, '_blank')}
                  >
                    Apply Now
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleSaveScholarship(selectedScholarship.scholarship.id)}
                    disabled={saveScholarshipMutation.isPending}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipHub;