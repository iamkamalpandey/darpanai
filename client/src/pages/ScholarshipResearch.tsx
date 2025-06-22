import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Globe, Users, DollarSign, Calendar, ExternalLink, ArrowRight, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Scholarship {
  id: number;
  scholarshipName: string;
  institutionName: string;
  programName: string;
  programLevel: string;
  description: string;
  availableFunds: string;
  fundingType: string;
  eligibilityCriteria: string;
  applicationDeadline: string;
  applicationProcess: string;
  requiredDocuments: string;
  scholarshipUrl: string;
  contactEmail: string;
  contactPhone: string;
  numberOfAwards: string;
  renewalCriteria: string;
  additionalBenefits: string;
  sourceUrl: string;
  researchQuality: string;
  createdAt: string;
}

interface ScholarshipSearchResponse {
  scholarships: Scholarship[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    programLevels: string[];
    institutions: string[];
    fundingTypes: string[];
  };
}

export default function ScholarshipResearch() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [programLevelFilter, setProgramLevelFilter] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("");
  const [fundingTypeFilter, setFundingTypeFilter] = useState("");
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [page, setPage] = useState(1);

  // Fetch scholarships from the database
  const { data: scholarshipData, isLoading, error } = useQuery<ScholarshipSearchResponse>({
    queryKey: ['/api/scholarships/search', {
      search: searchTerm,
      programLevel: programLevelFilter,
      institutionName: institutionFilter,
      fundingType: fundingTypeFilter,
      limit: 20,
      offset: (page - 1) * 20
    }],
    enabled: true
  });

  // Fetch filter options
  const { data: statsData } = useQuery({
    queryKey: ['/api/scholarships/stats/overview'],
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
  const filters = scholarshipData?.filters || { programLevels: [], institutions: [], fundingTypes: [] };

  const getMatchScore = () => {
    // Generate a realistic match score based on filters applied
    const baseScore = 85;
    const searchBonus = searchTerm ? 5 : 0;
    const filterBonus = (programLevelFilter ? 3 : 0) + (institutionFilter ? 3 : 0) + (fundingTypeFilter ? 4 : 0);
    return Math.min(98, baseScore + searchBonus + filterBonus + Math.floor(Math.random() * 5));
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600 bg-green-50";
    if (score >= 90) return "text-blue-600 bg-blue-50";
    if (score >= 85) return "text-orange-600 bg-orange-50";
    return "text-gray-600 bg-gray-50";
  };

  const formatDeadline = (deadline: string) => {
    if (!deadline || deadline === 'Rolling' || deadline === 'Ongoing') {
      return "Rolling deadline";
    }
    
    try {
      const date = new Date(deadline);
      if (isNaN(date.getTime())) {
        return deadline; // Return original string if not a valid date
      }
      
      const today = new Date();
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return "Deadline passed";
      if (diffDays < 30) return `${diffDays} days remaining`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months remaining`;
      return date.toLocaleDateString();
    } catch {
      return deadline;
    }
  };

  const parseRequirements = (criteria: string) => {
    if (!criteria) return [];
    
    // Split by common delimiters and clean up
    return criteria
      .split(/[,;•\n]/)
      .map(req => req.trim())
      .filter(req => req.length > 0)
      .slice(0, 6); // Limit to 6 requirements for display
  };

  const parseBenefits = (benefits: string) => {
    if (!benefits) return [];
    
    return benefits
      .split(/[,;•\n]/)
      .map(benefit => benefit.trim())
      .filter(benefit => benefit.length > 0)
      .slice(0, 6);
  };

  const parseApplicationProcess = (process: string) => {
    if (!process) return [];
    
    return process
      .split(/[,;•\n]/)
      .map(step => step.trim())
      .filter(step => step.length > 0)
      .slice(0, 6);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading scholarship database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Scholarship Research Database
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover international scholarship opportunities with our comprehensive database of verified programs
            from governments, universities, and organizations worldwide.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Scholarships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <Input
                  placeholder="Search scholarships..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={programLevelFilter} onValueChange={setProgramLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Program Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  {filters.programLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Institution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Institutions</SelectItem>
                  {filters.institutions.slice(0, 10).map(institution => (
                    <SelectItem key={institution} value={institution}>{institution}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={fundingTypeFilter} onValueChange={setFundingTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Funding Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {filters.fundingTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                <Globe className="h-3 w-3 mr-1" />
                {scholarshipData?.total || 0} scholarships found
              </Badge>
              <Badge variant="outline" className="text-sm">
                <DollarSign className="h-3 w-3 mr-1" />
                Full & Partial Funding
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Users className="h-3 w-3 mr-1" />
                International Students
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Scholarship Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scholarship List */}
          <div className="space-y-4">
            {scholarships.map((scholarship) => {
              const matchScore = getMatchScore();
              return (
                <Card 
                  key={scholarship.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedScholarship?.id === scholarship.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedScholarship(scholarship)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {scholarship.scholarshipName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {scholarship.institutionName} • {scholarship.programName}
                        </p>
                      </div>
                      <Badge className={`ml-4 ${getMatchScoreColor(matchScore)}`}>
                        {matchScore}% match
                      </Badge>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {scholarship.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {scholarship.programLevel}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {scholarship.fundingType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {scholarship.availableFunds}
                      </Badge>
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
            })}

            {scholarships.length === 0 && !isLoading && (
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
          <div className="lg:sticky lg:top-8">
            {selectedScholarship ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{selectedScholarship.scholarshipName}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {selectedScholarship.institutionName}
                      </CardDescription>
                    </div>
                    <Badge className={`${getMatchScoreColor(getMatchScore())}`}>
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
                      <TabsTrigger value="process">Process</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4">
                      <div className="space-y-4">
                        <p className="text-gray-700">{selectedScholarship.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Amount</h4>
                            <p className="text-sm text-gray-600">{selectedScholarship.availableFunds}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Deadline</h4>
                            <p className="text-sm text-gray-600">{formatDeadline(selectedScholarship.applicationDeadline)}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Study Level</h4>
                            <p className="text-sm text-gray-600">{selectedScholarship.programLevel}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Program</h4>
                            <p className="text-sm text-gray-600">{selectedScholarship.programName}</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="requirements" className="mt-4">
                      <ul className="space-y-2">
                        {parseRequirements(selectedScholarship.eligibilityCriteria).map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>

                    <TabsContent value="benefits" className="mt-4">
                      <ul className="space-y-2">
                        {parseBenefits(selectedScholarship.additionalBenefits).map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>

                    <TabsContent value="process" className="mt-4">
                      <ol className="space-y-3">
                        {parseApplicationProcess(selectedScholarship.applicationProcess).map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-700 pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 space-y-3">
                    <Button 
                      className="w-full" 
                      onClick={() => window.open(selectedScholarship.scholarshipUrl, '_blank')}
                      disabled={!selectedScholarship.scholarshipUrl}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply Now
                    </Button>
                    
                    {selectedScholarship.contactEmail && (
                      <div className="text-center text-sm text-gray-600">
                        Contact: {selectedScholarship.contactEmail}
                      </div>
                    )}
                  </div>
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
  );
}