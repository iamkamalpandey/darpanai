import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, Search, Filter, GraduationCap, MapPin, DollarSign, Calendar, Star, ExternalLink, Heart, Plus, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ScholarshipMatch {
  id: number;
  name: string;
  providerName: string;
  providerCountry: string;
  fundingType: string;
  totalValueMax: string;
  applicationDeadline: string;
  eligibilityLevel: string[];
  targetCountries: string[];
  fieldOfStudy: string[];
  matchScore: number;
  matchReasons: string[];
  description?: string;
  providerWebsite?: string;
}

interface UserProfile {
  academicLevel?: string;
  fieldOfStudy?: string;
  interestedCourse?: string;
  preferredCountries?: string[];
  budgetRange?: string;
  nationality?: string;
  highestQualification?: string;
  gpa?: number;
}

export function ScholarshipMatcher() {
  const [searchFilters, setSearchFilters] = useState({
    fieldFilter: 'all',
    countryFilter: 'all',
    levelFilter: 'all',
    fundingTypeFilter: 'all'
  });
  const [isMatching, setIsMatching] = useState(false);
  const [matchedScholarships, setMatchedScholarships] = useState<ScholarshipMatch[]>([]);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [watchlistItems, setWatchlistItems] = useState<Set<number>>(new Set());
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile for matching
  const { data: userData, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/user'],
  });

  const userProfile: UserProfile | null = userData || null;

  // Fetch user's watchlist
  const { data: watchlistData } = useQuery({
    queryKey: ['/api/watchlist'],
    enabled: !!userData,
  });

  // Fetch countries with active scholarships
  const { data: countriesData } = useQuery({
    queryKey: ['/api/scholarships/countries-with-scholarships'],
  });

  // Watchlist mutations
  const addToWatchlistMutation = useMutation({
    mutationFn: (scholarshipData: { scholarshipId: number; notes?: string; priorityLevel?: string }) =>
      apiRequest('POST', '/api/watchlist/add', scholarshipData),
    onSuccess: () => {
      toast({ title: "Added to Watchlist", description: "Scholarship saved successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add to watchlist", variant: "destructive" });
    }
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: (scholarshipId: number) =>
      apiRequest('DELETE', `/api/watchlist/remove/${scholarshipId}`),
    onSuccess: () => {
      toast({ title: "Removed from Watchlist", description: "Scholarship removed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove from watchlist", variant: "destructive" });
    }
  });

  // Initialize filters with user profile data and watchlist
  useEffect(() => {
    if (userProfile && !filtersInitialized) {
      setSearchFilters({
        fieldFilter: userProfile.fieldOfStudy || userProfile.interestedCourse || 'all',
        countryFilter: userProfile.preferredCountries?.[0] || 'all',
        levelFilter: 'all', // Will be handled by backend academic progression logic
        fundingTypeFilter: 'all'
      });
      setFiltersInitialized(true);
    }
  }, [userProfile, filtersInitialized]);

  // Update watchlist items when data changes
  useEffect(() => {
    if (watchlistData && typeof watchlistData === 'object' && watchlistData !== null) {
      const data = watchlistData as Record<string, any>;
      if ('watchlist' in data && Array.isArray(data.watchlist)) {
        const watchlistIds = new Set<number>(data.watchlist.map((item: any) => Number(item.scholarshipId)));
        setWatchlistItems(watchlistIds);
      }
    }
  }, [watchlistData]);

  // Watchlist actions
  const handleWatchlistToggle = (scholarship: ScholarshipMatch) => {
    if (watchlistItems.has(scholarship.id)) {
      removeFromWatchlistMutation.mutate(scholarship.id);
      setWatchlistItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(scholarship.id);
        return newSet;
      });
    } else {
      addToWatchlistMutation.mutate({
        scholarshipId: scholarship.id,
        priorityLevel: 'medium'
      });
      setWatchlistItems(prev => new Set(prev).add(scholarship.id));
    }
  };

  // Fetch scholarships based on user profile and filters
  const fetchMatchedScholarships = async () => {
    if (!userProfile) return [];

    setIsMatching(true);
    try {
      const response = await apiRequest('POST', '/api/scholarship-matching/match', {
        filters: {
          fieldFilter: searchFilters.fieldFilter === 'all' ? '' : searchFilters.fieldFilter,
          countryFilter: searchFilters.countryFilter === 'all' ? '' : searchFilters.countryFilter,
          levelFilter: searchFilters.levelFilter === 'all' ? '' : searchFilters.levelFilter,
          fundingTypeFilter: searchFilters.fundingTypeFilter === 'all' ? '' : searchFilters.fundingTypeFilter
        }
      });

      // Parse JSON response properly
      const data = await response.json();
      console.log('Scholarship API Response:', data);
      
      // Handle parsed response structure
      if (data && data.success && Array.isArray(data.scholarships)) {
        console.log('Scholarships received:', data.scholarships.length);
        setMatchedScholarships(data.scholarships);
        return data.scholarships;
      }
      
      console.log('No scholarships in response, data structure:', data);
      setMatchedScholarships([]);
      return [];
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      return [];
    } finally {
      setIsMatching(false);
    }
  };

  // Generate match reasons based on user profile and scholarship
  const generateMatchReasons = (scholarship: any, profile: UserProfile): string[] => {
    const reasons: string[] = [];
    
    if (profile.fieldOfStudy && scholarship.fieldOfStudy?.includes(profile.fieldOfStudy)) {
      reasons.push(`Matches your field: ${profile.fieldOfStudy}`);
    }
    
    if (profile.highestQualification && scholarship.eligibilityLevel?.includes(profile.highestQualification)) {
      reasons.push(`Suitable for ${profile.highestQualification} level`);
    }
    
    if (profile.preferredCountries?.some(country => scholarship.targetCountries?.includes(country))) {
      const matchingCountries = profile.preferredCountries.filter(country => 
        scholarship.targetCountries?.includes(country)
      );
      reasons.push(`Available in ${matchingCountries.join(', ')}`);
    }
    
    if (profile.nationality && scholarship.providerCountry) {
      reasons.push(`International students welcome`);
    }

    return reasons.length > 0 ? reasons : ['General eligibility match'];
  };

  // Load matched scholarships when profile and filters are ready
  useEffect(() => {
    if (userProfile && filtersInitialized) {
      fetchMatchedScholarships().then((scholarships) => {
        console.log('Setting scholarships in state:', scholarships);
        setMatchedScholarships(scholarships);
      });
    }
  }, [userProfile, searchFilters, filtersInitialized]);

  const handleFilterChange = (filterType: string, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setSearchFilters({
      fieldFilter: 'all',
      countryFilter: 'all',
      levelFilter: 'all',
      fundingTypeFilter: 'all'
    });
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your profile...</span>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Complete Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            To find scholarships that match your profile, please complete your academic information first.
          </p>
          <Button asChild>
            <a href="/profile">Complete Profile</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Your Academic Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Field of Study</p>
              <p className="font-medium">{userProfile.fieldOfStudy || userProfile.interestedCourse || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Academic Level</p>
              <p className="font-medium">{userProfile.highestQualification || 'Not specified'}</p>
              {userProfile.highestQualification && (
                <p className="text-xs text-blue-600 mt-1">
                  {userProfile.highestQualification === 'High School' 
                    ? 'Showing: Diploma, Bachelor\'s programs'
                    : userProfile.highestQualification === 'Diploma'
                    ? 'Showing: Diploma, Bachelor\'s, Master\'s programs'
                    : userProfile.highestQualification === "Bachelor's Degree"
                    ? 'Showing: Bachelor\'s, Master\'s, PhD programs'
                    : userProfile.highestQualification === "Master's Degree"
                    ? 'Showing: Master\'s, PhD programs'
                    : 'Showing: PhD, Postdoctoral programs'
                  }
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Preferred Countries</p>
              <p className="font-medium">
                {userProfile.preferredCountries?.join(', ') || 'Not specified'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Refine Your Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Country</label>
              <Select value={searchFilters.countryFilter} onValueChange={(value) => handleFilterChange('countryFilter', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countriesData?.data?.countries?.map((country: any) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.displayName}
                    </SelectItem>
                  )) || [
                    <SelectItem key="loading" value="" disabled>Loading countries...</SelectItem>
                  ]}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Academic Level</label>
              <Select value={searchFilters.levelFilter} onValueChange={(value) => handleFilterChange('levelFilter', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Bachelor's Degree">Bachelor's</SelectItem>
                  <SelectItem value="Master's Degree">Master's</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Funding Type</label>
              <Select value={searchFilters.fundingTypeFilter} onValueChange={(value) => handleFilterChange('fundingTypeFilter', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full Scholarship">Full Scholarship</SelectItem>
                  <SelectItem value="Partial Scholarship">Partial Scholarship</SelectItem>
                  <SelectItem value="Research Grant">Research Grant</SelectItem>
                  <SelectItem value="Merit-based">Merit-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => fetchMatchedScholarships().then(setMatchedScholarships)} disabled={isMatching}>
              {isMatching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Find Matching Scholarships
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>



      {/* Matched Scholarships */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Matched Scholarships ({matchedScholarships.length})
            </div>
            {isMatching && <Loader2 className="h-5 w-5 animate-spin" />}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Scholarships are ranked by relevance to your academic progression and field of study
          </p>
        </CardHeader>
        <CardContent>
          {/* Filter Summary */}
          <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm font-medium text-blue-800 mb-1">Active Intelligent Filters:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <div>• Deadline Filter: Active scholarships only (excludes expired opportunities)</div>
              <div>• Academic Level: Progressive matching based on your qualification level</div>
              <div>• Field Relevance: Prioritizing scholarships matching your study interests</div>
              <div>• Resource Optimization: Limited to top 20 most relevant matches</div>
            </div>
          </div>

          {isMatching ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Finding scholarships using intelligent filtering...</p>
              <p className="text-sm text-muted-foreground mt-2">Applying academic progression logic and relevance scoring</p>
            </div>
          ) : matchedScholarships.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No scholarships found matching your optimized criteria.</p>
              <p className="text-sm text-muted-foreground mt-2">Intelligent filtering excludes expired scholarships and irrelevant opportunities to save resources.</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {matchedScholarships.map((scholarship) => (
                  <Card key={scholarship.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                          <p className="text-muted-foreground">
                            {scholarship.providerName} • {scholarship.providerCountry}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {scholarship.matchScore}% match
                          </Badge>
                          <Button
                            variant={watchlistItems.has(scholarship.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleWatchlistToggle(scholarship)}
                            disabled={addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending}
                          >
                            {watchlistItems.has(scholarship.id) ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Saved
                              </>
                            ) : (
                              <>
                                <Heart className="h-4 w-4 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Funding</p>
                            <p className="font-medium">{scholarship.fundingType}</p>
                            {scholarship.totalValueMax && (
                              <p className="text-sm text-green-600">{scholarship.totalValueMax}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Deadline</p>
                            <p className="font-medium">{scholarship.applicationDeadline || 'Rolling'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Available In</p>
                            <p className="font-medium">{scholarship.targetCountries?.join(', ') || scholarship.providerCountry}</p>
                          </div>
                        </div>
                      </div>

                      {scholarship.description && (
                        <p className="text-sm text-muted-foreground mb-3">{scholarship.description}</p>
                      )}

                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Why this matches your profile:</p>
                        <div className="flex flex-wrap gap-1">
                          {scholarship.matchReasons.map((reason, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          View Details
                        </Button>
                        {scholarship.providerWebsite && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={scholarship.providerWebsite} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Official Site
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}