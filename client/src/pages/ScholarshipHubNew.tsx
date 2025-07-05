import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Link } from 'wouter';
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
  Info,
  Users,
  Target,
  Zap,
  Clock,
  Eye
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
  isSaved?: boolean;
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
  const { data: savedScholarshipsData, isLoading: isLoadingSaved } = useQuery<ApiResponse>({
    queryKey: ['/api/user-scholarships/saved'],
    queryFn: () => fetch('/api/user-scholarships/saved', { credentials: 'include' }).then(res => res.json()),
  });

  // Save/unsave scholarship mutation
  const saveScholarshipMutation = useMutation({
    mutationFn: (scholarshipId: number) => 
      apiRequest('POST', '/api/user-scholarships/save', { scholarshipId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-scholarships/saved'] });
      toast({ title: "Scholarship saved successfully!" });
    },
    onError: () => {
      toast({ title: "Error saving scholarship", variant: "destructive" });
    },
  });

  const toggleSaveScholarship = (scholarshipId: number) => {
    saveScholarshipMutation.mutate(scholarshipId);
  };

  // Transform database scholarships to match interface
  const transformScholarship = (dbScholarship: any): ScholarshipMatch => {
    return {
      scholarship: {
        id: dbScholarship.id,
        name: dbScholarship.name,
        provider: {
          name: dbScholarship.provider_name || 'Unknown Provider',
          country: Array.isArray(dbScholarship.target_countries) ? dbScholarship.target_countries[0] : 'Unknown',
          website: dbScholarship.application_url || '',
        },
        amount: dbScholarship.amount_display || 'Amount not specified',
        deadline: dbScholarship.deadline || '2025-12-31',
        studyLevels: Array.isArray(dbScholarship.level_of_study) ? dbScholarship.level_of_study : ['Bachelor\'s'],
        fieldCategories: Array.isArray(dbScholarship.fields_of_study) ? dbScholarship.fields_of_study : ['General'],
        hostCountries: Array.isArray(dbScholarship.target_countries) ? dbScholarship.target_countries : ['Global'],
        description: dbScholarship.description || 'Scholarship opportunity',
        eligibilityRequirements: dbScholarship.eligibility_summary || 'See official website for details',
        fundingType: dbScholarship.amount_display || 'Full funding',
      },
      matchScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      matchReasons: dbScholarship.match_reasons || ['Profile compatibility'],
      isSaved: false,
    };
  };

  // Transform stored recommendations to match interface  
  const transformRecommendation = (recommendation: any): ScholarshipMatch => {
    return {
      scholarship: {
        id: recommendation.scholarshipId,
        name: recommendation.scholarshipName,
        provider: {
          name: recommendation.providerName || 'Unknown Provider',
          country: recommendation.providerCountry || 'Various',
          website: recommendation.websiteUrl || '',
        },
        amount: recommendation.fundingAmount || 'Amount not specified',
        deadline: recommendation.applicationDeadline || '2025-12-31',
        studyLevels: Array.isArray(recommendation.targetCountries) ? recommendation.targetCountries : ['Bachelor\'s'],
        fieldCategories: Array.isArray(recommendation.targetCountries) ? recommendation.targetCountries : ['General'],
        hostCountries: Array.isArray(recommendation.targetCountries) ? recommendation.targetCountries : ['Global'],
        description: recommendation.scholarshipDescription || 'Scholarship opportunity',
        eligibilityRequirements: recommendation.eligibilityCriteria || 'See official website for details',
        fundingType: recommendation.fundingType || 'Merit-based',
      },
      matchScore: recommendation.matchScore || 75,
      matchReasons: Array.isArray(recommendation.matchReasons) ? recommendation.matchReasons : ['Profile compatibility'],
      isSaved: false,
    };
  };

  // Get data arrays - handle both response formats  
  const rawRecommendations = recommendationsData?.recommendations || [];
  const transformedRecommendations = rawRecommendations.map(transformRecommendation);
  
  // Handle different API response formats
  let rawScholarships = [];
  if (scholarshipsData?.scholarships && Array.isArray(scholarshipsData.scholarships)) {
    rawScholarships = scholarshipsData.scholarships;
  } else if (Array.isArray(scholarshipsData)) {
    rawScholarships = scholarshipsData;
  }
  
  const allScholarships = rawScholarships.map(transformScholarship);
  const savedScholarships = savedScholarshipsData?.scholarships || [];

  const ScholarshipCard = ({ match, showMatchScore = false }: { match: ScholarshipMatch; showMatchScore?: boolean }) => {
    const { scholarship, matchScore, matchReasons, isSaved } = match;
    
    // Determine urgency level based on deadline
    const getUrgencyLevel = (deadline: string) => {
      const deadlineDate = new Date(deadline);
      const currentDate = new Date();
      const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysUntilDeadline <= 30) return 'urgent';
      if (daysUntilDeadline <= 90) return 'moderate';
      return 'plenty';
    };

    const urgencyLevel = getUrgencyLevel(scholarship.deadline);
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
      <Card className="group h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
        {/* Gradient Header */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold leading-tight mb-3 group-hover:text-blue-600 transition-colors">
                {scholarship.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <div className="p-1 bg-blue-100 rounded-full">
                  <Globe className="w-3 h-3 text-blue-600" />
                </div>
                <span className="font-medium">{scholarship.provider?.name || 'Provider'}</span>
              </div>
              
              {showMatchScore && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    {matchScore}% Match
                  </div>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSaveScholarship(scholarship.id)}
              className="shrink-0 p-2 hover:bg-red-50 transition-colors"
            >
              <Heart className={`w-5 h-5 transition-all ${isSaved ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400 hover:text-red-400'}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <div className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {showSimpleMode
              ? scholarship.description?.replace(/\b(merit-based|need-based|academic excellence|CGPA|GPA)\b/gi, (match) => {
                  const replacements: { [key: string]: string } = {
                    'merit-based': 'for good grades',
                    'need-based': 'for financial help',
                    'academic excellence': 'high grades',
                    'CGPA': 'grade average',
                    'GPA': 'grade average'
                  };
                  return replacements[match.toLowerCase()] || match;
                })
              : scholarship.description}
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-700 text-sm">Funding Amount</p>
                <p className="text-green-600 font-bold">
                  {scholarship.amountDisplay || 'Funding Available'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-700 text-sm">Application Deadline</p>
                <div className="flex items-center gap-2">
                  <p className="text-blue-600 font-medium">{scholarship.deadline}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${urgencyColors[urgencyLevel]}`}
                  >
                    {urgencyText[urgencyLevel]}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="p-2 bg-purple-100 rounded-full">
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-purple-700 text-sm">Study Level</p>
                <p className="text-purple-600 font-medium text-sm">
                  {Array.isArray(scholarship.levelOfStudy) 
                    ? scholarship.levelOfStudy.join(', ') 
                    : scholarship.levelOfStudy || 'All Levels'}
                </p>
              </div>
            </div>
          </div>

          {/* Match Reasons */}
          {showMatchScore && matchReasons && matchReasons.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Why it's perfect for you:
              </p>
              <div className="space-y-1">
                {matchReasons.slice(0, 2).map((reason, index) => (
                  <p key={index} className="text-sm text-blue-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {reason}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Link href={`/scholarship-details/${scholarship.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full border-2 hover:bg-blue-50 hover:border-blue-300">
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-2 hover:bg-yellow-50 hover:border-yellow-300"
              onClick={() => {
                // Add to watchlist functionality
                console.log('Add to watchlist:', scholarship.id);
              }}
            >
              <Star className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              onClick={() => window.open(scholarship.applicationUrl, '_blank')}
            >
              <Award className="w-4 h-4 mr-1" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderScholarshipGrid = (scholarships: ScholarshipMatch[], showMatchScore: boolean, emptyMessage: string) => {
    if (scholarships.length === 0) {
      return (
        <div className="text-center py-12">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
          <p className="text-gray-500">Try adjusting your search or check back later.</p>
        </div>
      );
    }

    return scholarships.map((match) => (
      <ScholarshipCard key={match.scholarship.id} match={match} showMatchScore={showMatchScore} />
    ));
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Modern Header with Stats */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Award className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">Scholarship Universe</h1>
              </div>
              <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-8">
                AI-powered scholarship matching • Find your perfect funding opportunity
              </p>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-5 h-5" />
                    <span className="text-2xl font-bold">{transformedRecommendations.length}</span>
                  </div>
                  <p className="text-sm opacity-75">Matched</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Globe className="w-5 h-5" />
                    <span className="text-2xl font-bold">{allScholarships.length}</span>
                  </div>
                  <p className="text-sm opacity-75">Available</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-5 h-5" />
                    <span className="text-2xl font-bold">{savedScholarships.length}</span>
                  </div>
                  <p className="text-sm opacity-75">Saved</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-5 h-5" />
                    <span className="text-2xl font-bold">96%</span>
                  </div>
                  <p className="text-sm opacity-75">Match Rate</p>
                </div>
              </div>

              {/* Smart Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <Input
                    placeholder="Search by field, country, or scholarship name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-4 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-white/60 rounded-xl focus:bg-white/20 focus:border-white/40"
                  />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="recommendations" className="space-y-8">
            <div className="flex items-center justify-center">
              <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-2 shadow-lg">
                <TabsTrigger 
                  value="recommendations" 
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                >
                  <Star className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Matched</span>
                  <span className="sm:hidden">Matched</span>
                  <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700">
                    {transformedRecommendations.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="discover" 
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">Explore All</span>
                  <span className="sm:hidden">Explore</span>
                  <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">
                    {allScholarships.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="saved" 
                  className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                >
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">My Collection</span>
                  <span className="sm:hidden">Saved</span>
                  <Badge variant="secondary" className="ml-1 bg-red-100 text-red-700">
                    {savedScholarships.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

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
                ) : (
                  renderScholarshipGrid(transformedRecommendations, true, "No personalized recommendations yet. Complete your profile to get better matches!")
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
      </div>
    </DashboardLayout>
  );
}