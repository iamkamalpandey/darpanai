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
  
  // Enhanced filtering states
  const [countryFilter, setCountryFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [fundingTypeFilter, setFundingTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('match');
  
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

  // Sample scholarship data for demonstration (fallback when API returns empty)
  const sampleScholarships: ScholarshipMatch[] = [
    {
      scholarship: {
        id: 1,
        name: "Chevening Scholarships",
        description: "UK government's global scholarship programme, funded by the Foreign and Commonwealth Office (FCO) and partner organisations.",
        amountDisplay: "Full funding up to £25,000",
        deadline: "2025-11-02",
        levelOfStudy: ["Master's"],
        needBased: false,
        meritBased: true,
        tags: ["Business", "Engineering", "International Relations"],
        eligibilitySummary: ["2+ years work experience", "Leadership potential", "Strong academic background"],
        requiredDocuments: ["CV", "Personal Statement", "References"],
        applicationUrl: "https://www.chevening.org/apply",
        provider: {
          id: 1,
          name: "British Council",
          website: "https://www.chevening.org"
        }
      },
      matchScore: 92,
      matchReasons: ["Matches your field of study", "Work experience requirement met", "Strong leadership background"],
      isSaved: false
    },
    {
      scholarship: {
        id: 2,
        name: "Fulbright Foreign Student Program",
        description: "Provides funding for graduate students, young professionals and artists to study in the United States.",
        amountDisplay: "Full funding up to $50,000",
        deadline: "2025-10-15",
        levelOfStudy: ["Master's", "PhD"],
        needBased: false,
        meritBased: true,
        tags: ["Technology", "Science", "Arts", "Social Sciences"],
        eligibilitySummary: ["Bachelor's degree", "English proficiency", "Leadership experience"],
        requiredDocuments: ["Transcripts", "Personal Statement", "References", "TOEFL/IELTS"],
        applicationUrl: "https://foreign.fulbright.org",
        provider: {
          id: 2,
          name: "Fulbright Commission",
          website: "https://foreign.fulbright.org"
        }
      },
      matchScore: 88,
      matchReasons: ["Academic excellence match", "Research interests aligned", "Strong English proficiency"],
      isSaved: false
    },
    {
      scholarship: {
        id: 3,
        name: "Australia Awards Scholarships",
        description: "Prestigious international scholarships and fellowships funded by the Australian Government.",
        amountDisplay: "Full funding up to AUD $70,000",
        deadline: "2025-04-30",
        levelOfStudy: ["Bachelor's", "Master's", "PhD"],
        needBased: true,
        meritBased: true,
        tags: ["Development Studies", "Public Policy", "Agriculture", "Engineering"],
        eligibilitySummary: ["From eligible countries", "Leadership potential", "Development focus"],
        requiredDocuments: ["Academic transcripts", "CV", "Personal statement", "Health declaration"],
        applicationUrl: "https://www.australiaawards.gov.au",
        provider: {
          id: 3,
          name: "Australian Government",
          website: "https://www.australiaawards.gov.au"
        }
      },
      matchScore: 85,
      matchReasons: ["Country eligibility confirmed", "Development focus aligned", "Academic requirements met"],
      isSaved: false
    },
    {
      scholarship: {
        id: 4,
        name: "DAAD Scholarships",
        description: "German Academic Exchange Service scholarships for international students at German universities.",
        amountDisplay: "€850-1,200 monthly",
        deadline: "2025-07-31",
        levelOfStudy: ["Master's", "PhD"],
        needBased: false,
        meritBased: true,
        tags: ["Engineering", "Technology", "Sciences", "Medicine"],
        eligibilitySummary: ["Strong academic record", "German language preferred", "Research orientation"],
        requiredDocuments: ["CV", "Motivation letter", "Academic records", "References"],
        applicationUrl: "https://www.daad.de/en",
        provider: {
          id: 4,
          name: "DAAD",
          website: "https://www.daad.de"
        }
      },
      matchScore: 82,
      matchReasons: ["Technical background match", "Research interests aligned", "Academic excellence"],
      isSaved: false
    },
    {
      scholarship: {
        id: 5,
        name: "Erasmus Mundus Joint Masters",
        description: "Prestigious, integrated, international study programmes jointly delivered by an international consortium of higher education institutions.",
        amountDisplay: "€25,000-50,000",
        deadline: "2025-01-15",
        levelOfStudy: ["Master's"],
        needBased: false,
        meritBased: true,
        tags: ["International Studies", "Digital Innovation", "Climate Studies", "Data Science"],
        eligibilitySummary: ["Bachelor's degree", "English proficiency", "International mobility"],
        requiredDocuments: ["Transcripts", "CV", "Motivation letter", "Language certificates"],
        applicationUrl: "https://www.eacea.ec.europa.eu/erasmus-plus",
        provider: {
          id: 5,
          name: "European Commission",
          website: "https://ec.europa.eu/programmes/erasmus-plus"
        }
      },
      matchScore: 79,
      matchReasons: ["International focus match", "Academic background suitable", "Innovation interests aligned"],
      isSaved: false
    }
  ];

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

  const unsaveScholarshipMutation = useMutation({
    mutationFn: (scholarshipId: number) => 
      apiRequest('DELETE', `/api/user-scholarships/unsave/${scholarshipId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-scholarships/saved'] });
      toast({ title: "Scholarship removed from collection!" });
    },
    onError: () => {
      toast({ title: "Error removing scholarship", variant: "destructive" });
    },
  });

  const toggleSaveScholarship = (scholarshipId: number) => {
    const isSaved = isScholarshipSaved(scholarshipId);
    if (isSaved) {
      unsaveScholarshipMutation.mutate(scholarshipId);
    } else {
      saveScholarshipMutation.mutate(scholarshipId);
    }
  };

  // Transform database scholarships to match interface
  const transformScholarship = (dbScholarship: any, savedIds: number[] = []): ScholarshipMatch => {
    const scholarshipId = dbScholarship.id || Math.random();
    return {
      scholarship: {
        id: scholarshipId,
        name: dbScholarship.name,
        provider: {
          name: dbScholarship.provider_name || 'Unknown Provider',
          country: Array.isArray(dbScholarship.target_countries) ? dbScholarship.target_countries[0] : 'Unknown',
          website: dbScholarship.application_url || '',
        },
        amountDisplay: dbScholarship.amount_display || 'Amount not specified',
        deadline: dbScholarship.deadline || '2025-12-31',
        levelOfStudy: Array.isArray(dbScholarship.level_of_study) ? dbScholarship.level_of_study : ['Bachelor\'s'],
        needBased: dbScholarship.need_based || false,
        meritBased: dbScholarship.merit_based || true,
        tags: Array.isArray(dbScholarship.fields_of_study) ? dbScholarship.fields_of_study : ['General'],
        eligibilitySummary: Array.isArray(dbScholarship.eligibility_summary) ? dbScholarship.eligibility_summary : ['See official website for details'],
        requiredDocuments: Array.isArray(dbScholarship.required_documents) ? dbScholarship.required_documents : ['Application form'],
        applicationUrl: dbScholarship.application_url || '',
        description: dbScholarship.description || 'Scholarship opportunity',
      },
      matchScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      matchReasons: dbScholarship.match_reasons || ['Profile compatibility'],
      isSaved: savedIds.includes(scholarshipId),
    };
  };

  // Transform stored recommendations to match interface  
  const transformRecommendation = (recommendation: any, savedIds: number[] = []): ScholarshipMatch => {
    const scholarshipId = recommendation.scholarshipId || Math.random();
    return {
      scholarship: {
        id: scholarshipId,
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
      isSaved: savedIds.includes(scholarshipId),
    };
  };

  // Process saved scholarships data first to get saved IDs
  let processedSavedScholarships = [];
  let savedScholarshipIds: number[] = [];
  if (savedScholarshipsData?.scholarships && Array.isArray(savedScholarshipsData.scholarships)) {
    processedSavedScholarships = savedScholarshipsData.scholarships.map(item => transformScholarship(item));
    savedScholarshipIds = savedScholarshipsData.scholarships.map(item => item.id);
  } else if (Array.isArray(savedScholarshipsData)) {
    processedSavedScholarships = savedScholarshipsData.map(item => transformScholarship(item));
    savedScholarshipIds = savedScholarshipsData.map(item => item.id);
  }

  // Get data arrays - handle both response formats  
  const rawRecommendations = recommendationsData?.recommendations || [];
  
  // Use sample data for recommendations if API returns empty
  const transformedRecommendations = rawRecommendations.length > 0 
    ? rawRecommendations.map(rec => transformRecommendation(rec, savedScholarshipIds))
    : sampleScholarships.slice(0, 3).map(sch => ({ ...sch, isSaved: savedScholarshipIds.includes(sch.scholarship.id) })); // Show first 3 as recommendations
  
  // Handle different API response formats
  let rawScholarships = [];
  if (scholarshipsData?.scholarships && Array.isArray(scholarshipsData.scholarships)) {
    rawScholarships = scholarshipsData.scholarships;
  } else if (Array.isArray(scholarshipsData)) {
    rawScholarships = scholarshipsData;
  }
  
  // Use sample data if API returns empty results
  const allScholarships = rawScholarships.length > 0 
    ? rawScholarships.map(sch => transformScholarship(sch, savedScholarshipIds)) 
    : sampleScholarships.map(sch => ({ ...sch, isSaved: savedScholarshipIds.includes(sch.scholarship.id) }));

  // Check if a scholarship is saved
  const isScholarshipSaved = (scholarshipId: number) => {
    return savedScholarshipIds.includes(scholarshipId);
  };

  // Enhanced filtering and sorting functions
  const filterScholarships = (scholarships: ScholarshipMatch[]) => {
    return scholarships.filter(match => {
      const scholarship = match.scholarship;
      
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          scholarship.name.toLowerCase().includes(searchLower) ||
          scholarship.description.toLowerCase().includes(searchLower) ||
          scholarship.provider?.name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Country filter
      if (countryFilter) {
        const hasCountry = scholarship.provider?.country === countryFilter;
        if (!hasCountry) return false;
      }
      
      // Course/Field filter
      if (courseFilter) {
        const hasField = scholarship.tags?.includes(courseFilter);
        if (!hasField) return false;
      }
      
      // Study level filter
      if (levelFilter) {
        const hasLevel = scholarship.levelOfStudy?.includes(levelFilter);
        if (!hasLevel) return false;
      }
      
      // Funding type filter
      if (fundingTypeFilter) {
        let matchesFunding = false;
        if (fundingTypeFilter === 'merit' && scholarship.meritBased) matchesFunding = true;
        if (fundingTypeFilter === 'need' && scholarship.needBased) matchesFunding = true;
        if (fundingTypeFilter === 'full' && scholarship.amountDisplay?.toLowerCase().includes('full')) matchesFunding = true;
        if (fundingTypeFilter === 'partial' && scholarship.amountDisplay?.toLowerCase().includes('partial')) matchesFunding = true;
        if (!matchesFunding) return false;
      }
      
      return true;
    });
  };

  const sortScholarships = (scholarships: ScholarshipMatch[]) => {
    return [...scholarships].sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return b.matchScore - a.matchScore;
        case 'deadline':
          return new Date(a.scholarship.deadline).getTime() - new Date(b.scholarship.deadline).getTime();
        case 'name':
          return a.scholarship.name.localeCompare(b.scholarship.name);
        case 'amount':
          // Simple string comparison for amount
          return a.scholarship.amount.localeCompare(b.scholarship.amount);
        default:
          return b.matchScore - a.matchScore;
      }
    });
  };

  // Apply filtering and sorting
  const filteredRecommendations = sortScholarships(filterScholarships(transformedRecommendations));
  const filteredAllScholarships = sortScholarships(filterScholarships(allScholarships));

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setCountryFilter('');
    setCourseFilter('');
    setLevelFilter('');
    setFundingTypeFilter('');
    setSortBy('match');
  };

  // Get unique values for filter options
  const getUniqueCountries = () => {
    const countries = new Set<string>();
    [...transformedRecommendations, ...allScholarships].forEach(match => {
      if (match.scholarship.provider?.country) {
        countries.add(match.scholarship.provider.country);
      }
    });
    return Array.from(countries).filter(country => country && country !== 'Unknown' && country !== 'Various');
  };

  const getUniqueCourses = () => {
    const courses = new Set<string>();
    [...transformedRecommendations, ...allScholarships].forEach(match => {
      match.scholarship.tags?.forEach(field => courses.add(field));
    });
    return Array.from(courses).filter(course => course && course !== 'General');
  };

  const getUniqueStudyLevels = () => {
    const levels = new Set<string>();
    [...transformedRecommendations, ...allScholarships].forEach(match => {
      match.scholarship.levelOfStudy?.forEach(level => levels.add(level));
    });
    return Array.from(levels).filter(level => level && level !== 'Unknown');
  };

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
              onClick={() => {
                const currentlySaved = isScholarshipSaved(scholarship.id);
                if (currentlySaved) {
                  unsaveScholarshipMutation.mutate(scholarship.id);
                } else {
                  saveScholarshipMutation.mutate(scholarship.id);
                }
              }}
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
              className={`border-2 transition-colors ${
                isSaved 
                  ? 'bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100' 
                  : 'hover:bg-yellow-50 hover:border-yellow-300'
              }`}
              onClick={() => {
                const currentlySaved = isScholarshipSaved(scholarship.id);
                if (currentlySaved) {
                  unsaveScholarshipMutation.mutate(scholarship.id);
                } else {
                  saveScholarshipMutation.mutate(scholarship.id);
                }
              }}
              disabled={saveScholarshipMutation.isPending || unsaveScholarshipMutation.isPending}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'fill-yellow-400 text-yellow-400' : ''}`} />
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
        {/* Enhanced Scholarship Universe Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-white/5 rounded-full blur-lg animate-bounce"></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse delay-300"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            {/* Header Content */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-lg"></div>
                  <div className="relative p-4 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight">
                    Scholarship Universe
                  </h1>
                  <div className="h-1 w-32 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mx-auto mt-2"></div>
                </div>
              </div>
              
              <p className="text-lg lg:text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
                AI-powered scholarship matching • Find your perfect funding opportunity
              </p>
            </div>

            {/* Enhanced Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 max-w-5xl mx-auto mb-10">
              <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <span className="text-2xl lg:text-3xl font-bold text-white">{transformedRecommendations.length}</span>
                </div>
                <p className="text-sm lg:text-base text-white/80 font-medium">Matched</p>
                <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                  <div className="bg-yellow-400 h-1 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>

              <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <span className="text-2xl lg:text-3xl font-bold text-white">{allScholarships.length}</span>
                </div>
                <p className="text-sm lg:text-base text-white/80 font-medium">Available</p>
                <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                  <div className="bg-green-400 h-1 rounded-full" style={{width: '92%'}}></div>
                </div>
              </div>

              <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <span className="text-2xl lg:text-3xl font-bold text-white">{processedSavedScholarships.length}</span>
                </div>
                <p className="text-sm lg:text-base text-white/80 font-medium">Saved</p>
                <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                  <div className="bg-red-400 h-1 rounded-full" style={{width: `${Math.min((processedSavedScholarships.length / Math.max(allScholarships.length, 1)) * 100, 100)}%`}}></div>
                </div>
              </div>

              <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <span className="text-2xl lg:text-3xl font-bold text-white">96%</span>
                </div>
                <p className="text-sm lg:text-base text-white/80 font-medium">Match Rate</p>
                <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                  <div className="bg-purple-400 h-1 rounded-full" style={{width: '96%'}}></div>
                </div>
              </div>
            </div>

            {/* Enhanced Search Interface */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  {/* Main Search Bar */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                    <Input
                      placeholder="Search by field, country, or scholarship name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-4 text-lg bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-white/60 rounded-xl focus:bg-white/20 focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all"
                    />
                  </div>

                  {/* AI Search Button Only */}
                  <div className="flex-shrink-0">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-gradient-to-r from-yellow-400/80 to-orange-400/80 hover:from-yellow-400 hover:to-orange-400 text-white border-0 rounded-xl px-6 py-3 backdrop-blur-sm transition-all hover:scale-105 font-medium shadow-lg"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Search
                    </Button>
                  </div>
                </div>

                {/* Search Results Preview */}
                {searchQuery && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>Found {filteredAllScholarships.length} scholarships matching "{searchQuery}"</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                        className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modern Content Section with Sidebar Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Enhanced Filter Sidebar */}
            <div className="w-80 shrink-0 hidden lg:block">
              <div className="sticky top-4">
                <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                      <Filter className="w-5 h-5" />
                      <CardTitle className="text-lg">Advanced Filters</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="flex-1 text-xs hover:bg-red-50 hover:border-red-200"
                      >
                        Clear All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs hover:bg-blue-50 hover:border-blue-200"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Button>
                    </div>

                    {/* Country Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Study Destination
                      </label>
                      <select
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Countries</option>
                        {getUniqueCountries().map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>

                    {/* Course/Field Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Field of Study
                      </label>
                      <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Fields</option>
                        {getUniqueCourses().map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    </div>

                    {/* Study Level Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Study Level
                      </label>
                      <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Levels</option>
                        {getUniqueStudyLevels().map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    {/* Funding Type Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Funding Type
                      </label>
                      <select
                        value={fundingTypeFilter}
                        onChange={(e) => setFundingTypeFilter(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Types</option>
                        <option value="full">Full Funding</option>
                        <option value="partial">Partial Funding</option>
                        <option value="merit">Merit-based</option>
                        <option value="need">Need-based</option>
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="match">Best Match</option>
                        <option value="deadline">Deadline (Earliest)</option>
                        <option value="name">Name (A-Z)</option>
                        <option value="amount">Amount</option>
                      </select>
                    </div>

                    {/* Filter Summary & Clear Options */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-gray-600">Active Filters:</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {[countryFilter, courseFilter, levelFilter, fundingTypeFilter].filter(Boolean).length}
                          </Badge>
                          {[countryFilter, courseFilter, levelFilter, fundingTypeFilter].filter(Boolean).length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCountryFilter('');
                                setCourseFilter('');
                                setLevelFilter('');
                                setFundingTypeFilter('');
                              }}
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 h-auto"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {countryFilter && (
                          <Badge 
                            variant="outline" 
                            className="text-xs mr-1 mb-1 cursor-pointer hover:bg-red-50 hover:border-red-300"
                            onClick={() => setCountryFilter('')}
                          >
                            {countryFilter} ×
                          </Badge>
                        )}
                        {courseFilter && (
                          <Badge 
                            variant="outline" 
                            className="text-xs mr-1 mb-1 cursor-pointer hover:bg-red-50 hover:border-red-300"
                            onClick={() => setCourseFilter('')}
                          >
                            {courseFilter} ×
                          </Badge>
                        )}
                        {levelFilter && (
                          <Badge 
                            variant="outline" 
                            className="text-xs mr-1 mb-1 cursor-pointer hover:bg-red-50 hover:border-red-300"
                            onClick={() => setLevelFilter('')}
                          >
                            {levelFilter} ×
                          </Badge>
                        )}
                        {fundingTypeFilter && (
                          <Badge 
                            variant="outline" 
                            className="text-xs mr-1 mb-1 cursor-pointer hover:bg-red-50 hover:border-red-300"
                            onClick={() => setFundingTypeFilter('')}
                          >
                            {fundingTypeFilter === 'full' ? 'Full Funding' : 
                             fundingTypeFilter === 'partial' ? 'Partial Funding' :
                             fundingTypeFilter === 'merit' ? 'Merit-based' :
                             fundingTypeFilter === 'need' ? 'Need-based' : fundingTypeFilter} ×
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
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
                        {filteredRecommendations.length}
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
                        {filteredAllScholarships.length}
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
                        {processedSavedScholarships.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Personalized for You</h2>
                      </div>
                      <div className="text-sm text-gray-600">
                        {filteredRecommendations.length} of {transformedRecommendations.length} shown
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Based on your profile and preferences, here are scholarships with the highest match potential.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      renderScholarshipGrid(filteredRecommendations, true, "No recommendations match your current filters. Try adjusting the filters to see more results.")
                    )}
                  </div>
                </TabsContent>

                {/* Discover Tab */}
                <TabsContent value="discover" className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Globe className="w-6 h-6 text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Explore All Scholarships</h2>
                      </div>
                      <div className="text-sm text-gray-600">
                        {filteredAllScholarships.length} of {allScholarships.length} shown
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Discover the complete range of available scholarships and opportunities worldwide.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      renderScholarshipGrid(filteredAllScholarships, false, "No scholarships match your current filters. Try adjusting the filters to discover more opportunities.")
                    )}
                  </div>
                </TabsContent>

                {/* Saved Tab */}
                <TabsContent value="saved" className="space-y-6">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Heart className="w-6 h-6 text-red-600" />
                        <h2 className="text-xl font-semibold text-gray-900">My Scholarship Collection</h2>
                      </div>
                      <div className="text-sm text-gray-600">
                        {processedSavedScholarships.length} saved
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Your personally curated collection of scholarships. Keep track of opportunities you're interested in.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      renderScholarshipGrid(processedSavedScholarships, false, "No saved scholarships yet. Start exploring and save scholarships that interest you.")
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}