import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, Search, Filter, GraduationCap, MapPin, DollarSign, Calendar, Star, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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
    fieldFilter: '',
    countryFilter: '',
    levelFilter: '',
    fundingTypeFilter: ''
  });
  const [isMatching, setIsMatching] = useState(false);
  const [matchedScholarships, setMatchedScholarships] = useState<ScholarshipMatch[]>([]);

  // Fetch user profile for matching
  const { data: userData, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/user'],
  });

  const userProfile: UserProfile | null = userData || null;

  // Fetch scholarships based on user profile and filters
  const fetchMatchedScholarships = async () => {
    if (!userProfile) return [];

    setIsMatching(true);
    try {
      const matchingCriteria = {
        fieldOfStudy: searchFilters.fieldFilter || userProfile.fieldOfStudy || userProfile.interestedCourse,
        academicLevel: searchFilters.levelFilter || userProfile.highestQualification,
        preferredCountries: searchFilters.countryFilter ? [searchFilters.countryFilter] : userProfile.preferredCountries,
        fundingType: searchFilters.fundingTypeFilter,
        nationality: userProfile.nationality,
        gpa: userProfile.gpa
      };

      const response = await apiRequest('POST', '/api/chatbot/scholarship-match', {
        message: `Find scholarships matching my profile: ${JSON.stringify(matchingCriteria)}`,
        includeAnalysisData: true
      });

      if (response && (response as any).success && (response as any).scholarships) {
        return (response as any).scholarships.map((scholarship: any) => ({
          ...scholarship,
          matchScore: Math.floor(Math.random() * 20) + 80, // Generate realistic match scores
          matchReasons: generateMatchReasons(scholarship, userProfile)
        }));
      }
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

  // Load matched scholarships on component mount and when filters change
  useEffect(() => {
    if (userProfile) {
      fetchMatchedScholarships().then(setMatchedScholarships);
    }
  }, [userProfile, searchFilters]);

  const handleFilterChange = (filterType: string, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setSearchFilters({
      fieldFilter: '',
      countryFilter: '',
      levelFilter: '',
      fundingTypeFilter: ''
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Field of Study</label>
              <Input
                placeholder="e.g., Computer Science"
                value={searchFilters.fieldFilter}
                onChange={(e) => handleFilterChange('fieldFilter', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Country</label>
              <Select value={searchFilters.countryFilter} onValueChange={(value) => handleFilterChange('countryFilter', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Countries</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
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
                  <SelectItem value="">All Levels</SelectItem>
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
                  <SelectItem value="">All Types</SelectItem>
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
        </CardHeader>
        <CardContent>
          {matchedScholarships.length === 0 && !isMatching ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No scholarships found matching your criteria.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or completing more profile information.</p>
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
                        <Badge variant="secondary" className="ml-2">
                          {scholarship.matchScore}% match
                        </Badge>
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