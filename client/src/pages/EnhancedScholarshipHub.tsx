import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Link } from 'wouter';
import {
  Heart,
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
  Users,
  Target,
  Zap,
  Clock,
  Eye,
  ExternalLink,
  Bookmark,
  Check,
  CheckCircle,
  Star,
  MapPin,
  ArrowRight,
  X,
  RefreshCw,
  Brain,
  User,
  Shield,
  AlertCircle,
  Lightbulb,
  ThumbsUp,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface EnhancedScholarshipMatch {
  scholarship: any;
  matchScore: number;
  matchReasons: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  personalizedMessage: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  applicationDifficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Very Challenging';
  isSaved?: boolean;
}

interface ApiResponse {
  recommendations?: EnhancedScholarshipMatch[];
  total?: number;
  type?: string;
}

export default function EnhancedScholarshipHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState<EnhancedScholarshipMatch | null>(null);
  const [activeTab, setActiveTab] = useState('personalized');
  
  // Enhanced filtering states
  const [countryFilter, setCountryFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [fundingTypeFilter, setFundingTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('match');
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch enhanced scholarship recommendations
  const { data: enhancedRecommendationsData, isLoading: isLoadingEnhanced } = useQuery<ApiResponse>({
    queryKey: ['/api/scholarship-recommendations/enhanced'],
    queryFn: () => fetch('/api/scholarship-recommendations/enhanced', { credentials: 'include' }).then(res => res.json()),
  });

  // Fetch all scholarships for browse tab
  const { data: scholarshipsData, isLoading: isLoadingScholarships } = useQuery<ApiResponse>({
    queryKey: ['/api/scholarships/search'],
    queryFn: () => fetch('/api/scholarships/search', { credentials: 'include' }).then(res => res.json()),
  });

  // Fetch saved scholarships
  const { data: savedScholarshipsData } = useQuery<any>({
    queryKey: ['/api/user-scholarships/saved'],
    queryFn: () => fetch('/api/user-scholarships/saved', { credentials: 'include' }).then(res => res.json()),
  });

  // Save/unsave scholarship mutations
  const saveScholarshipMutation = useMutation({
    mutationFn: (scholarshipId: number) => 
      apiRequest('POST', '/api/user-scholarships/save', { scholarshipId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-scholarships/saved'] });
      toast({ title: "Scholarship saved to watchlist!" });
    },
    onError: () => {
      toast({ title: "Error saving scholarship", variant: "destructive" });
    },
  });

  const unsaveScholarshipMutation = useMutation({
    mutationFn: (scholarshipId: number) => 
      apiRequest('DELETE', `/api/user-scholarships/unsave/${scholarshipId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-scholarships/saved'] });
      toast({ title: "Scholarship removed from watchlist!" });
    },
    onError: () => {
      toast({ title: "Error removing scholarship", variant: "destructive" });
    },
  });

  // Check if scholarship is saved
  const isScholarshipSaved = (scholarshipId: number): boolean => {
    if (!savedScholarshipsData?.scholarships) return false;
    return savedScholarshipsData.scholarships.some((s: any) => s.id === scholarshipId);
  };

  const toggleSaveScholarship = (scholarshipId: number) => {
    const isSaved = isScholarshipSaved(scholarshipId);
    if (isSaved) {
      unsaveScholarshipMutation.mutate(scholarshipId);
    } else {
      saveScholarshipMutation.mutate(scholarshipId);
    }
  };

  // Get personalized recommendations
  const personalizedRecommendations = enhancedRecommendationsData?.recommendations || [];

  // Filter and process recommendations
  const getFilteredRecommendations = () => {
    let filtered = [...personalizedRecommendations];

    if (searchQuery) {
      filtered = filtered.filter(match =>
        match.scholarship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.scholarship.providerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (countryFilter && countryFilter !== 'all_countries') {
      filtered = filtered.filter(match =>
        match.scholarship.host_countries?.includes(countryFilter)
      );
    }

    if (levelFilter && levelFilter !== 'all_levels') {
      filtered = filtered.filter(match =>
        match.scholarship.study_levels?.includes(levelFilter)
      );
    }

    if (fundingTypeFilter && fundingTypeFilter !== 'all_funding') {
      filtered = filtered.filter(match =>
        match.scholarship.fundingType?.toLowerCase().includes(fundingTypeFilter.toLowerCase())
      );
    }

    // Sort recommendations
    if (sortBy === 'match') {
      filtered.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'deadline') {
      filtered.sort((a, b) => new Date(a.scholarship.applicationDeadline).getTime() - new Date(b.scholarship.applicationDeadline).getTime());
    } else if (sortBy === 'confidence') {
      const confidenceOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      filtered.sort((a, b) => confidenceOrder[b.confidenceLevel] - confidenceOrder[a.confidenceLevel]);
    }

    return filtered;
  };

  const filteredRecommendations = getFilteredRecommendations();

  // Get confidence color
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Moderate': return 'text-blue-600 bg-blue-50';
      case 'Challenging': return 'text-orange-600 bg-orange-50';
      case 'Very Challenging': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'Not specified';
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Deadline passed';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 30) return `${diffDays} days left`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months left`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  Personalized Scholarship Hub
                </h1>
                <p className="text-gray-600 mt-2">AI-powered scholarship matching based on your profile</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                  <Brain className="w-4 h-4 mr-1" />
                  Enhanced AI Matching
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1 rounded-xl">
              <TabsTrigger value="personalized" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg">
                <Target className="w-4 h-4 mr-2" />
                Personalized for You
              </TabsTrigger>
              <TabsTrigger value="browse" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg">
                <Search className="w-4 h-4 mr-2" />
                Browse All
              </TabsTrigger>
              <TabsTrigger value="saved" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg">
                <Heart className="w-4 h-4 mr-2" />
                Saved
              </TabsTrigger>
            </TabsList>

            {/* Personalized Recommendations Tab */}
            <TabsContent value="personalized" className="space-y-6">
              {/* Search and Filters */}
              <Card className="bg-white/80 backdrop-blur border-gray-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search your personalized recommendations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="whitespace-nowrap"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                    </div>

                    {showFilters && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                        <Select value={countryFilter} onValueChange={setCountryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_countries">All Countries</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="United States">United States</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={levelFilter} onValueChange={setLevelFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Study Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_levels">All Levels</SelectItem>
                            <SelectItem value="Bachelor">Bachelor's</SelectItem>
                            <SelectItem value="Master">Master's</SelectItem>
                            <SelectItem value="PhD">PhD</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={fundingTypeFilter} onValueChange={setFundingTypeFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Funding Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_funding">All Funding</SelectItem>
                            <SelectItem value="full">Full Funding</SelectItem>
                            <SelectItem value="partial">Partial Funding</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="match">Match Score</SelectItem>
                            <SelectItem value="deadline">Deadline</SelectItem>
                            <SelectItem value="confidence">Confidence</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Loading State */}
              {isLoadingEnhanced && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Analyzing your profile for personalized recommendations...</p>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              {!isLoadingEnhanced && filteredRecommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Total Matches</p>
                          <p className="text-3xl font-bold">{filteredRecommendations.length}</p>
                        </div>
                        <Target className="w-8 h-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">High Confidence</p>
                          <p className="text-3xl font-bold">
                            {filteredRecommendations.filter(r => r.confidenceLevel === 'High').length}
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">Avg Match Score</p>
                          <p className="text-3xl font-bold">
                            {Math.round(filteredRecommendations.reduce((sum, r) => sum + r.matchScore, 0) / filteredRecommendations.length)}%
                          </p>
                        </div>
                        <Star className="w-8 h-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100">Easy Applications</p>
                          <p className="text-3xl font-bold">
                            {filteredRecommendations.filter(r => r.applicationDifficulty === 'Easy').length}
                          </p>
                        </div>
                        <ThumbsUp className="w-8 h-8 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Recommendations List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRecommendations.map((match, index) => (
                  <Card key={index} className="bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getConfidenceColor(match.confidenceLevel)} border text-xs font-medium px-2 py-1`}>
                              {match.confidenceLevel} Confidence
                            </Badge>
                            <Badge className={`${getDifficultyColor(match.applicationDifficulty)} text-xs font-medium px-2 py-1`}>
                              {match.applicationDifficulty}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                            {match.scholarship.name}
                          </h3>
                          <p className="text-gray-600 text-sm">{match.scholarship.providerName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{match.matchScore}%</div>
                            <div className="text-xs text-gray-500">Match</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSaveScholarship(match.scholarship.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Heart className={`w-5 h-5 ${isScholarshipSaved(match.scholarship.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Personalized Message */}
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-800 font-medium">
                            {match.personalizedMessage}
                          </p>
                        </div>
                      </div>

                      {/* Key Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-700">{match.scholarship.fundingType || 'Funding available'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-700">{formatDeadline(match.scholarship.applicationDeadline)}</span>
                        </div>

                        {match.scholarship.host_countries && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">
                              {Array.isArray(match.scholarship.host_countries) 
                                ? match.scholarship.host_countries.slice(0, 2).join(', ')
                                : match.scholarship.host_countries}
                              {Array.isArray(match.scholarship.host_countries) && match.scholarship.host_countries.length > 2 && 
                                ` +${match.scholarship.host_countries.length - 2} more`
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Strength Areas */}
                      {match.strengthAreas.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Your Strengths</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {match.strengthAreas.slice(0, 3).map((strength, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Match Reasons */}
                      {match.matchReasons.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <Lightbulb className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Why it matches</span>
                          </div>
                          <ul className="space-y-1">
                            {match.matchReasons.slice(0, 2).map((reason, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                                <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/scholarship-details/${match.scholarship.id}`}>
                          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                        {match.scholarship.applicationUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={match.scholarship.applicationUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {!isLoadingEnhanced && filteredRecommendations.length === 0 && (
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-12 text-center">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No personalized recommendations yet</h3>
                    <p className="text-gray-600 mb-6">
                      Complete your profile to get AI-powered scholarship recommendations tailored to your background and goals.
                    </p>
                    <Link href="/profile">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <User className="w-4 h-4 mr-2" />
                        Complete Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Browse All Tab - Can add general scholarship browsing here */}
            <TabsContent value="browse">
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse All Scholarships</h3>
                  <p className="text-gray-600 mb-6">
                    Explore our complete database of scholarship opportunities
                  </p>
                  <Link href="/scholarship-research">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Search className="w-4 h-4 mr-2" />
                      Start Browsing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saved Tab */}
            <TabsContent value="saved">
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Saved Scholarships</h3>
                  <p className="text-gray-600 mb-6">
                    Manage your scholarship watchlist and application deadlines
                  </p>
                  <Link href="/my-watchlist">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Heart className="w-4 h-4 mr-2" />
                      View Watchlist
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}