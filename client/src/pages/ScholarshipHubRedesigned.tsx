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
  Brain
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
    country?: string;
  };
}

interface ScholarshipMatch {
  scholarship: ScholarshipProgram;
  matchScore: number;
  matchReasons: string[];
  isSaved?: boolean;
}

interface ApiResponse {
  recommendations?: ScholarshipMatch[];
  scholarships?: ScholarshipMatch[];
  total?: number;
}

export default function ScholarshipHubRedesigned() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipMatch | null>(null);
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

  // Fetch scholarship recommendations
  const { data: recommendationsData, isLoading: isLoadingRecommendations } = useQuery<ApiResponse>({
    queryKey: ['/api/scholarship-recommendations'],
    queryFn: () => fetch('/api/scholarship-recommendations', { credentials: 'include' }).then(res => res.json()),
  });

  // Fetch all scholarships
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

  // Sample data for demonstration when API returns empty
  const sampleScholarships: ScholarshipMatch[] = [
    {
      scholarship: {
        id: 1,
        name: "Chevening Scholarships",
        description: "UK government's global scholarship programme for outstanding emerging leaders worldwide.",
        amountDisplay: "Full funding up to £25,000",
        deadline: "2025-11-03",
        levelOfStudy: ["Master's"],
        needBased: false,
        meritBased: true,
        tags: ["Leadership", "Public Policy", "International Relations"],
        eligibilitySummary: ["Bachelor's degree", "Work experience", "Leadership potential"],
        requiredDocuments: ["Essays", "References", "Transcripts", "English test"],
        applicationUrl: "https://www.chevening.org/apply",
        provider: {
          id: 1,
          name: "UK Government",
          website: "https://www.chevening.org",
          country: "United Kingdom"
        }
      },
      matchScore: 95,
      matchReasons: ["Leadership experience", "Academic excellence", "Career goals alignment"],
      isSaved: false
    },
    {
      scholarship: {
        id: 2,
        name: "Fulbright Foreign Student Program",
        description: "Prestigious program providing opportunities for international students to study in the United States.",
        amountDisplay: "Full funding $50,000+",
        deadline: "2025-10-15",
        levelOfStudy: ["Master's", "PhD"],
        needBased: false,
        meritBased: true,
        tags: ["Research", "Innovation", "Cultural Exchange"],
        eligibilitySummary: ["Academic excellence", "Leadership potential", "English proficiency"],
        requiredDocuments: ["Personal statement", "Academic records", "Letters of recommendation"],
        applicationUrl: "https://foreign.fulbrightonline.org",
        provider: {
          id: 2,
          name: "U.S. Department of State",
          website: "https://us.fulbrightonline.org",
          country: "United States"
        }
      },
      matchScore: 88,
      matchReasons: ["Research interests", "Academic background", "Innovation focus"],
      isSaved: false
    }
  ];

  // Transform and filter data
  const transformedRecommendations = recommendationsData?.recommendations?.map(rec => ({
    ...rec,
    isSaved: isScholarshipSaved(rec.scholarship?.id || 0)
  })) || [];

  const allScholarships = [...transformedRecommendations, ...sampleScholarships].map(scholarship => ({
    ...scholarship,
    isSaved: isScholarshipSaved(scholarship.scholarship?.id || 0)
  }));

  // Apply filters
  const filterScholarships = (scholarships: ScholarshipMatch[]) => {
    return scholarships.filter(match => {
      const scholarship = match.scholarship;
      
      // Search filter
      if (searchQuery && !scholarship?.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !scholarship?.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !scholarship?.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Country filter
      if (countryFilter && scholarship?.provider?.country !== countryFilter) {
        return false;
      }
      
      // Course filter
      if (courseFilter && !scholarship?.tags?.some(tag => tag.toLowerCase().includes(courseFilter.toLowerCase()))) {
        return false;
      }
      
      // Level filter
      if (levelFilter && !scholarship?.levelOfStudy?.includes(levelFilter)) {
        return false;
      }
      
      // Funding type filter
      if (fundingTypeFilter === 'merit' && !scholarship?.meritBased) return false;
      if (fundingTypeFilter === 'need' && !scholarship?.needBased) return false;
      
      return true;
    });
  };

  // Sort scholarships
  const sortScholarships = (scholarships: ScholarshipMatch[]) => {
    return [...scholarships].sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return b.matchScore - a.matchScore;
        case 'deadline':
          return new Date(a.scholarship?.deadline || '2025-12-31').getTime() - new Date(b.scholarship?.deadline || '2025-12-31').getTime();
        case 'name':
          return (a.scholarship?.name || '').localeCompare(b.scholarship?.name || '');
        default:
          return b.matchScore - a.matchScore;
      }
    });
  };

  const filteredScholarships = sortScholarships(filterScholarships(allScholarships));
  const personalizedScholarships = sortScholarships(filterScholarships(transformedRecommendations.length > 0 ? transformedRecommendations : sampleScholarships));

  // Clear filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setCountryFilter('');
    setCourseFilter('');
    setLevelFilter('');
    setFundingTypeFilter('');
    setSortBy('match');
  };

  // Get unique filter options
  const getUniqueCountries = () => {
    const countries = new Set<string>();
    allScholarships.forEach(match => {
      if (match.scholarship.provider?.country) {
        countries.add(match.scholarship.provider.country);
      }
    });
    return Array.from(countries).filter(country => country && country !== 'Unknown');
  };

  const getUniqueCourses = () => {
    const courses = new Set<string>();
    allScholarships.forEach(match => {
      match.scholarship.tags?.forEach(field => courses.add(field));
    });
    return Array.from(courses);
  };

  const getUniqueStudyLevels = () => {
    const levels = new Set<string>();
    allScholarships.forEach(match => {
      match.scholarship.levelOfStudy?.forEach(level => levels.add(level));
    });
    return Array.from(levels);
  };

  // Scholarship Card Component
  const ScholarshipCard = ({ match, showMatchScore = true }: { match: ScholarshipMatch; showMatchScore?: boolean }) => {
    const { scholarship, matchScore, matchReasons } = match;
    const isSaved = isScholarshipSaved(scholarship?.id || 0);
    
    // Calculate urgency
    const getUrgencyLevel = (deadline?: string) => {
      if (!deadline) return 'plenty';
      
      const deadlineDate = new Date(deadline);
      const currentDate = new Date();
      const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysUntilDeadline <= 30) return 'urgent';
      if (daysUntilDeadline <= 90) return 'moderate';
      return 'plenty';
    };

    const urgencyLevel = getUrgencyLevel(scholarship?.deadline);
    const urgencyColors = {
      urgent: 'text-red-600 bg-red-50 border-red-200',
      moderate: 'text-orange-600 bg-orange-50 border-orange-200',
      plenty: 'text-green-600 bg-green-50 border-green-200'
    };

    const urgencyText = {
      urgent: 'Apply Soon!',
      moderate: 'Upcoming Deadline',
      plenty: 'Good Time to Apply'
    };

    return (
      <Card className="group h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 bg-white overflow-hidden">
        {/* Header with gradient */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {scholarship?.name || 'Scholarship Name'}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{scholarship?.provider?.name || 'Provider'}</span>
                {scholarship?.provider?.country && (
                  <Badge variant="outline" className="text-xs">
                    {scholarship?.provider?.country}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {showMatchScore && (
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-bold text-green-700">{matchScore}% Match</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isSaved ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                onClick={() => toggleSaveScholarship(scholarship?.id || 0)}
                disabled={saveScholarshipMutation.isPending || unsaveScholarshipMutation.isPending}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {scholarship?.description || 'No description available'}
          </p>
          
          {/* Key details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-700">{scholarship?.amountDisplay || 'Not specified'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>Deadline: {scholarship?.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'No deadline'}</span>
              <Badge className={`text-xs ${urgencyColors[urgencyLevel]}`}>
                {urgencyText[urgencyLevel]}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>{scholarship?.levelOfStudy?.join(', ') || 'Not specified'}</span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {scholarship?.tags?.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {scholarship?.tags && scholarship.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{scholarship.tags.length - 3} more
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Match reasons */}
          {showMatchScore && matchReasons && matchReasons.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Why this matches you:</h4>
              <div className="space-y-1">
                {matchReasons.slice(0, 2).map((reason, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button asChild className="flex-1 h-9 text-sm">
              <Link href={`/scholarship-details/${scholarship?.id || 0}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3"
              onClick={() => {
                if (scholarship?.id) {
                  if (isScholarshipSaved(scholarship.id)) {
                    unsaveScholarshipMutation.mutate(scholarship.id);
                  } else {
                    saveScholarshipMutation.mutate(scholarship.id);
                  }
                }
              }}
              disabled={saveScholarshipMutation.isPending || unsaveScholarshipMutation.isPending}
            >
              {isScholarshipSaved(scholarship?.id || 0) ? (
                <Check className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
            
            {scholarship?.applicationUrl && (
              <Button 
                variant="outline" 
                size="sm"
                className="h-9 px-3"
                onClick={() => window.open(scholarship?.applicationUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Scholarship Hub</h1>
            <p className="text-gray-600">Discover and apply to scholarships matched to your profile</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available</p>
                    <p className="text-xl font-bold">{filteredScholarships.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Brain className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Matched</p>
                    <p className="text-xl font-bold">{personalizedScholarships.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saved</p>
                    <p className="text-xl font-bold">{savedScholarshipsData?.scholarships?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Urgent</p>
                    <p className="text-xl font-bold">
                      {filteredScholarships.filter(s => {
                        if (!s.scholarship?.deadline) return false;
                        const deadline = new Date(s.scholarship.deadline);
                        const now = new Date();
                        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
                        return daysLeft <= 30;
                      }).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search scholarships by name, provider, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {(countryFilter || courseFilter || levelFilter || fundingTypeFilter) && (
                      <Badge variant="secondary" className="ml-1">
                        {[countryFilter, courseFilter, levelFilter, fundingTypeFilter].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                  
                  {(searchQuery || countryFilter || courseFilter || levelFilter || fundingTypeFilter) && (
                    <Button variant="ghost" onClick={clearAllFilters} className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Expanded Filters */}
              {showFilters && (
                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Countries</SelectItem>
                        {getUniqueCountries().map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Field of Study" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Fields</SelectItem>
                        {getUniqueCourses().map(course => (
                          <SelectItem key={course} value={course}>{course}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Study Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Levels</SelectItem>
                        {getUniqueStudyLevels().map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="match">Best Match</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Scholarship Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="personalized" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Personalized for You
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                All Scholarships
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personalized">
              {isLoadingRecommendations ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading personalized recommendations...</span>
                </div>
              ) : personalizedScholarships.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {personalizedScholarships.map((match) => (
                    <ScholarshipCard key={match.scholarship?.id || Math.random()} match={match} showMatchScore={true} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Building Your Personalized Recommendations</h3>
                  <p className="text-gray-500 mb-4">Complete your profile to receive AI-powered scholarship matches.</p>
                  <Button asChild>
                    <Link href="/profile">Complete Profile</Link>
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="all">
              {isLoadingScholarships ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading scholarships...</span>
                </div>
              ) : filteredScholarships.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredScholarships.map((match) => (
                    <ScholarshipCard key={match.scholarship?.id || Math.random()} match={match} showMatchScore={false} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Scholarships Found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters.</p>
                  <Button onClick={clearAllFilters}>Clear All Filters</Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              Quick Actions
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <Bookmark className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">My Watchlist</CardTitle>
                      <p className="text-sm text-gray-600">View saved scholarships</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/scholarship-collection">
                      View Watchlist ({savedScholarshipsData?.scholarships?.length || 0})
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Search className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Advanced Search</CardTitle>
                      <p className="text-sm text-gray-600">Research with filters</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/scholarship-research-hub">
                      Research Hub
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Get Help</CardTitle>
                      <p className="text-sm text-gray-600">Expert guidance</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/consultations">
                      Book Consultation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}