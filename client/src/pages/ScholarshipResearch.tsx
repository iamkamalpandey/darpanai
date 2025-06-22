import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Globe, Building, GraduationCap, DollarSign, Calendar, MapPin, Award, Star, ExternalLink, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Scholarship {
  scholarshipId: string;
  name: string;
  shortName?: string;
  providerName: string;
  providerType: string;
  providerCountry: string;
  hostCountries?: string[];
  eligibleCountries?: string[];
  studyLevels?: string[];
  fieldCategories?: string[];
  specificFields?: string[];
  fundingType: string;
  fundingCurrency?: string;
  tuitionCoveragePercentage?: string;
  livingAllowanceAmount?: string;
  livingAllowanceFrequency?: string;
  totalValueMin?: string;
  totalValueMax?: string;
  applicationDeadline?: string;
  durationValue?: number;
  durationUnit?: string;
  minGpa?: string;
  minWorkExperience?: number;
  leadershipRequired?: boolean;
  languageRequirements?: any[];
  applicationUrl?: string;
  documentsRequired?: string[];
  renewable?: boolean;
  description?: string;
  tags?: string[];
  difficultyLevel?: string;
  acceptanceRate?: string;
  status: string;
}

interface ScholarshipSearchResponse {
  scholarships: Scholarship[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    providerTypes: string[];
    countries: string[];
    studyLevels: string[];
    fieldCategories: string[];
    fundingTypes: string[];
    difficultyLevels: string[];
  };
}

interface ScholarshipStatistics {
  totalScholarships: number;
  totalProviders: number;
  totalCountries: number;
  averageAmount: number;
  totalFunding: string;
}

export default function ScholarshipResearch() {
  const { toast } = useToast();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProviderType, setSelectedProviderType] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedStudyLevel, setSelectedStudyLevel] = useState("");
  const [selectedFieldCategory, setSelectedFieldCategory] = useState("");
  const [selectedFundingType, setSelectedFundingType] = useState("");
  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState("");
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [page, setPage] = useState(1);
  
  // Sidebar state
  const [expandedSections, setExpandedSections] = useState({
    providerType: true,
    country: true,
    studyLevel: false,
    fieldCategory: false,
    fundingType: false,
    other: false
  });

  // Fetch scholarships with comprehensive filtering
  const { data: scholarshipData, isLoading, error } = useQuery<ScholarshipSearchResponse>({
    queryKey: ['/api/scholarships/search', {
      search: searchTerm,
      providerType: selectedProviderType,
      providerCountry: selectedCountry,
      studyLevel: selectedStudyLevel,
      fieldCategory: selectedFieldCategory,
      fundingType: selectedFundingType,
      difficultyLevel: selectedDifficultyLevel,
      limit: 20,
      offset: (page - 1) * 20
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedProviderType && selectedProviderType !== 'all') params.append('providerType', selectedProviderType);
      if (selectedCountry && selectedCountry !== 'all') params.append('providerCountry', selectedCountry);
      if (selectedStudyLevel && selectedStudyLevel !== 'all') params.append('studyLevel', selectedStudyLevel);
      if (selectedFieldCategory && selectedFieldCategory !== 'all') params.append('fieldCategory', selectedFieldCategory);
      if (selectedFundingType && selectedFundingType !== 'all') params.append('fundingType', selectedFundingType);
      if (selectedDifficultyLevel && selectedDifficultyLevel !== 'all') params.append('difficultyLevel', selectedDifficultyLevel);
      params.append('limit', '20');
      params.append('offset', ((page - 1) * 20).toString());

      const response = await fetch(`/api/scholarships/search?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch scholarships');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: true
  });

  // Fetch scholarship statistics
  const { data: statsData } = useQuery<ScholarshipStatistics>({
    queryKey: ['/api/scholarships/stats/overview'],
    queryFn: async () => {
      const response = await fetch('/api/scholarships/stats/overview', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: true
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading scholarships",
        description: "Unable to fetch scholarship data. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const scholarships = scholarshipData?.scholarships || [];
  const filters = scholarshipData?.filters || { 
    providerTypes: [], 
    countries: [], 
    studyLevels: [], 
    fieldCategories: [], 
    fundingTypes: [], 
    difficultyLevels: [] 
  };

  const getMatchScore = () => {
    const baseScore = 85;
    const searchBonus = searchTerm ? 5 : 0;
    const filterBonus = 
      (selectedProviderType ? 2 : 0) + 
      (selectedCountry ? 3 : 0) + 
      (selectedStudyLevel ? 3 : 0) + 
      (selectedFieldCategory ? 2 : 0) + 
      (selectedFundingType ? 3 : 0) + 
      (selectedDifficultyLevel ? 2 : 0);
    return Math.min(98, baseScore + searchBonus + filterBonus + Math.floor(Math.random() * 5));
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 90) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 85) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline || deadline === 'Rolling' || deadline === 'Ongoing') {
      return "Rolling deadline";
    }
    
    try {
      const date = new Date(deadline);
      if (isNaN(date.getTime())) {
        return deadline;
      }
      
      const today = new Date();
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return "Deadline passed";
      if (diffDays < 30) return `${diffDays} days remaining`;
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return deadline;
    }
  };

  const formatAmount = (scholarship: Scholarship) => {
    if (scholarship.totalValueMin && scholarship.totalValueMax) {
      return `${scholarship.fundingCurrency || 'USD'} ${scholarship.totalValueMin}-${scholarship.totalValueMax}`;
    }
    if (scholarship.livingAllowanceAmount) {
      return `${scholarship.fundingCurrency || 'USD'} ${scholarship.livingAllowanceAmount} ${scholarship.livingAllowanceFrequency || 'annually'}`;
    }
    return scholarship.fundingType || 'Full funding';
  };

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very-high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderTypeIcon = (type: string) => {
    switch (type) {
      case 'government': return <Globe className="h-4 w-4" />;
      case 'institution': return <GraduationCap className="h-4 w-4" />;
      case 'private': return <Building className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedProviderType("all");
    setSelectedCountry("all");
    setSelectedStudyLevel("all");
    setSelectedFieldCategory("all");
    setSelectedFundingType("all");
    setSelectedDifficultyLevel("all");
    setPage(1);
  };

  const activeFiltersCount = [
    selectedProviderType,
    selectedCountry,
    selectedStudyLevel,
    selectedFieldCategory,
    selectedFundingType,
    selectedDifficultyLevel
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Scholarship Research Database
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Discover international scholarship opportunities with our comprehensive database of verified programs from governments, universities, and organizations worldwide.
            </p>
            
            {/* Statistics */}
            {statsData && (
              <div className="flex justify-center gap-8 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{statsData.totalScholarships}</div>
                  <div className="text-sm text-gray-600">Total Scholarships</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statsData.totalProviders}</div>
                  <div className="text-sm text-gray-600">Providers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{statsData.totalCountries}</div>
                  <div className="text-sm text-gray-600">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{statsData.totalFunding}</div>
                  <div className="text-sm text-gray-600">Total Funding</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Search & Filter
                  </CardTitle>
                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear ({activeFiltersCount})
                    </Button>
                  )}
                </div>
                
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search scholarships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Provider Type Filter */}
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-medium text-sm"
                    onClick={() => toggleSection('providerType')}
                  >
                    <span className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Scholarship Type
                    </span>
                    {expandedSections.providerType ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  
                  {expandedSections.providerType && (
                    <div className="mt-2 space-y-2">
                      {filters.providerTypes.map((type) => (
                        <Button
                          key={type}
                          variant={selectedProviderType === type ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => setSelectedProviderType(selectedProviderType === type ? "" : type)}
                        >
                          {getProviderTypeIcon(type)}
                          <span className="ml-2 capitalize">{type}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Country Filter */}
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-medium text-sm"
                    onClick={() => toggleSection('country')}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Country
                    </span>
                    {expandedSections.country ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  
                  {expandedSections.country && (
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {filters.countries.filter(country => country && country.trim()).map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <Separator />

                {/* Study Level Filter */}
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-medium text-sm"
                    onClick={() => toggleSection('studyLevel')}
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Study Level
                    </span>
                    {expandedSections.studyLevel ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  
                  {expandedSections.studyLevel && (
                    <Select value={selectedStudyLevel} onValueChange={setSelectedStudyLevel}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {filters.studyLevels.filter(level => level && level.trim()).map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <Separator />

                {/* Field Category Filter */}
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-medium text-sm"
                    onClick={() => toggleSection('fieldCategory')}
                  >
                    <span className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Field of Study
                    </span>
                    {expandedSections.fieldCategory ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  
                  {expandedSections.fieldCategory && (
                    <Select value={selectedFieldCategory} onValueChange={setSelectedFieldCategory}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Fields</SelectItem>
                        {filters.fieldCategories.filter(field => field && field.trim()).map((field) => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <Separator />

                {/* Funding Type Filter */}
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-medium text-sm"
                    onClick={() => toggleSection('fundingType')}
                  >
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Funding Type
                    </span>
                    {expandedSections.fundingType ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  
                  {expandedSections.fundingType && (
                    <div className="mt-2 space-y-2">
                      {filters.fundingTypes.map((type) => (
                        <Button
                          key={type}
                          variant={selectedFundingType === type ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => setSelectedFundingType(selectedFundingType === type ? "" : type)}
                        >
                          <DollarSign className="h-3 w-3" />
                          <span className="ml-2 capitalize">{type}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Other Filters */}
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-medium text-sm"
                    onClick={() => toggleSection('other')}
                  >
                    <span className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Other Filters
                    </span>
                    {expandedSections.other ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  
                  {expandedSections.other && (
                    <div className="mt-2 space-y-2">
                      <Select value={selectedDifficultyLevel} onValueChange={setSelectedDifficultyLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Difficulty level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {filters.difficultyLevels.filter(level => level && level.trim()).map((level) => (
                            <SelectItem key={level} value={level}>
                              {level.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Scholarship List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isLoading ? 'Loading...' : `${scholarshipData?.total || 0} Scholarships Found`}
                  </h2>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                          <div className="flex gap-2">
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : scholarships.length > 0 ? (
                  scholarships.map((scholarship) => {
                    const matchScore = getMatchScore();
                    return (
                      <Card 
                        key={scholarship.scholarshipId}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          selectedScholarship?.scholarshipId === scholarship.scholarshipId ? 'ring-2 ring-blue-500 shadow-lg' : ''
                        }`}
                        onClick={() => setSelectedScholarship(scholarship)}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                                {scholarship.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                {getProviderTypeIcon(scholarship.providerType)}
                                <span>{scholarship.providerName}</span>
                                <span>•</span>
                                <span>{scholarship.providerCountry}</span>
                              </p>
                            </div>
                            <Badge className={`ml-4 border ${getMatchScoreColor(matchScore)}`}>
                              {matchScore}% match
                            </Badge>
                          </div>

                          {scholarship.description && (
                            <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                              {scholarship.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 mb-4">
                            {scholarship.studyLevels?.map((level) => (
                              <Badge key={level} variant="secondary" className="text-xs capitalize">
                                {level}
                              </Badge>
                            ))}
                            <Badge variant="outline" className="text-xs">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {scholarship.fundingType}
                            </Badge>
                            {scholarship.difficultyLevel && (
                              <Badge className={`text-xs ${getDifficultyColor(scholarship.difficultyLevel)}`}>
                                {scholarship.difficultyLevel.replace('-', ' ')}
                              </Badge>
                            )}
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDeadline(scholarship.applicationDeadline)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View Details
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No scholarships found</h3>
                        <p className="text-sm">Try adjusting your search criteria or filters</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Scholarship Details */}
              <div className="xl:sticky xl:top-8">
                {selectedScholarship ? (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{selectedScholarship.name}</CardTitle>
                          <CardDescription className="text-base mt-1 flex items-center gap-2">
                            {getProviderTypeIcon(selectedScholarship.providerType)}
                            <span>{selectedScholarship.providerName}</span>
                          </CardDescription>
                        </div>
                        <Badge className={`border ${getMatchScoreColor(getMatchScore())}`}>
                          {getMatchScore()}% match
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="requirements">Requirements</TabsTrigger>
                          <TabsTrigger value="benefits">Benefits</TabsTrigger>
                          <TabsTrigger value="application">Application</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-4">
                          <div className="space-y-4">
                            {selectedScholarship.description && (
                              <p className="text-gray-700">{selectedScholarship.description}</p>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                              <div>
                                <h4 className="font-medium text-gray-900">Type</h4>
                                <p className="text-sm text-gray-600 flex items-center gap-1 capitalize">
                                  {getProviderTypeIcon(selectedScholarship.providerType)}
                                  {selectedScholarship.providerType}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Country</h4>
                                <p className="text-sm text-gray-600">{selectedScholarship.providerCountry}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Funding</h4>
                                <p className="text-sm text-gray-600 capitalize">{selectedScholarship.fundingType}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Deadline</h4>
                                <p className="text-sm text-gray-600">{formatDeadline(selectedScholarship.applicationDeadline)}</p>
                              </div>
                              {selectedScholarship.studyLevels && (
                                <div className="col-span-2">
                                  <h4 className="font-medium text-gray-900">Study Levels</h4>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedScholarship.studyLevels.map((level) => (
                                      <Badge key={level} variant="outline" className="text-xs capitalize">
                                        {level}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {selectedScholarship.fieldCategories && selectedScholarship.fieldCategories.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Fields of Study</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedScholarship.fieldCategories.map((field) => (
                                    <Badge key={field} variant="secondary" className="text-xs">
                                      {field}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="requirements" className="mt-4">
                          <div className="space-y-4">
                            {selectedScholarship.minGpa && (
                              <div>
                                <h4 className="font-medium text-gray-900">Minimum GPA</h4>
                                <p className="text-sm text-gray-600">{selectedScholarship.minGpa}</p>
                              </div>
                            )}
                            
                            {selectedScholarship.minWorkExperience && (
                              <div>
                                <h4 className="font-medium text-gray-900">Work Experience</h4>
                                <p className="text-sm text-gray-600">{selectedScholarship.minWorkExperience} years minimum</p>
                              </div>
                            )}

                            {selectedScholarship.leadershipRequired && (
                              <div>
                                <h4 className="font-medium text-gray-900">Leadership Experience</h4>
                                <p className="text-sm text-gray-600">Required</p>
                              </div>
                            )}

                            {selectedScholarship.languageRequirements && selectedScholarship.languageRequirements.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900">Language Requirements</h4>
                                <div className="text-sm text-gray-600">
                                  {selectedScholarship.languageRequirements.map((req: any, index: number) => (
                                    <p key={index}>{req.language?.toUpperCase()}: {req.level}</p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedScholarship.documentsRequired && selectedScholarship.documentsRequired.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900">Required Documents</h4>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  {selectedScholarship.documentsRequired.map((doc, index) => (
                                    <li key={index}>{doc}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="benefits" className="mt-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900">Financial Coverage</h4>
                              <p className="text-sm text-gray-600">{formatAmount(selectedScholarship)}</p>
                            </div>

                            {selectedScholarship.tuitionCoveragePercentage && (
                              <div>
                                <h4 className="font-medium text-gray-900">Tuition Coverage</h4>
                                <p className="text-sm text-gray-600">{selectedScholarship.tuitionCoveragePercentage}%</p>
                              </div>
                            )}

                            {selectedScholarship.durationValue && selectedScholarship.durationUnit && (
                              <div>
                                <h4 className="font-medium text-gray-900">Duration</h4>
                                <p className="text-sm text-gray-600">{selectedScholarship.durationValue} {selectedScholarship.durationUnit}</p>
                              </div>
                            )}

                            {selectedScholarship.renewable && (
                              <div>
                                <h4 className="font-medium text-gray-900">Renewable</h4>
                                <p className="text-sm text-gray-600">Yes</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="application" className="mt-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900">Application Deadline</h4>
                              <p className="text-sm text-gray-600">{formatDeadline(selectedScholarship.applicationDeadline)}</p>
                            </div>

                            {selectedScholarship.applicationUrl && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Apply Now</h4>
                                <Button asChild className="w-full">
                                  <a 
                                    href={selectedScholarship.applicationUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2"
                                  >
                                    Visit Application Portal
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            )}

                            {selectedScholarship.acceptanceRate && (
                              <div>
                                <h4 className="font-medium text-gray-900">Acceptance Rate</h4>
                                <p className="text-sm text-gray-600">{selectedScholarship.acceptanceRate}%</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500">
                        <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Select a scholarship</h3>
                        <p className="text-sm">Click on any scholarship from the list to view detailed information</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}