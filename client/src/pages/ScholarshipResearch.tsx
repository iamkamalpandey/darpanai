import { useState } from "react";
import { Search, Filter, Globe, Building, GraduationCap, DollarSign, Calendar, MapPin, Award, Star, ExternalLink, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/DashboardLayout";

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

export default function ScholarshipResearch() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProviderType, setSelectedProviderType] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedStudyLevel, setSelectedStudyLevel] = useState("");
  const [selectedFieldCategory, setSelectedFieldCategory] = useState("");
  const [selectedFundingType, setSelectedFundingType] = useState("");
  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState("");
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  
  // Sidebar state
  const [expandedSections, setExpandedSections] = useState({
    providerType: true,
    country: true,
    studyLevel: false,
    fieldCategory: false,
    fundingType: false,
    other: false
  });

  // Frontend-only scholarship data
  const sampleScholarships: Scholarship[] = [
    {
      scholarshipId: "1",
      name: "MIT Graduate Fellowship in AI & Computing",
      providerName: "Massachusetts Institute of Technology",
      providerType: "university",
      providerCountry: "United States",
      hostCountries: ["United States"],
      eligibleCountries: ["Global"],
      studyLevels: ["Master's", "PhD"],
      fieldCategories: ["Engineering", "Computer Science", "Technology"],
      specificFields: ["Artificial Intelligence", "Machine Learning", "Computer Science"],
      fundingType: "Full funding",
      fundingCurrency: "USD",
      tuitionCoveragePercentage: "100%",
      livingAllowanceAmount: "3,500",
      livingAllowanceFrequency: "Monthly",
      totalValueMin: "80,000",
      totalValueMax: "120,000",
      applicationDeadline: "2025-12-15",
      durationValue: 2,
      durationUnit: "years",
      minGpa: "3.7",
      minWorkExperience: 0,
      leadershipRequired: true,
      languageRequirements: [{ test: "IELTS", minScore: 7.0 }],
      applicationUrl: "https://mit.edu/fellowships",
      documentsRequired: ["Transcripts", "SOP", "Letters of Recommendation"],
      renewable: true,
      description: "Prestigious fellowship for outstanding graduate students in AI and computing fields",
      tags: ["AI", "Technology", "Research"],
      difficultyLevel: "Very High",
      acceptanceRate: "5%",
      status: "Active"
    },
    {
      scholarshipId: "2", 
      name: "University of Waterloo Excellence Scholarship",
      providerName: "University of Waterloo",
      providerType: "university",
      providerCountry: "Canada",
      hostCountries: ["Canada"],
      eligibleCountries: ["Global"],
      studyLevels: ["Bachelor's", "Master's"],
      fieldCategories: ["Engineering", "Computer Science", "Mathematics"],
      specificFields: ["Software Engineering", "Computer Engineering", "Applied Mathematics"],
      fundingType: "Partial funding",
      fundingCurrency: "CAD",
      tuitionCoveragePercentage: "75%",
      livingAllowanceAmount: "2,000",
      livingAllowanceFrequency: "Monthly",
      totalValueMin: "40,000",
      totalValueMax: "60,000",
      applicationDeadline: "2025-11-30",
      durationValue: 1,
      durationUnit: "year",
      minGpa: "3.5",
      minWorkExperience: 0,
      leadershipRequired: false,
      languageRequirements: [{ test: "IELTS", minScore: 6.5 }],
      applicationUrl: "https://uwaterloo.ca/scholarships",
      documentsRequired: ["Academic Transcripts", "Personal Statement"],
      renewable: true,
      description: "Merit-based scholarship for international students in STEM fields",
      tags: ["STEM", "Merit-based", "International"],
      difficultyLevel: "High",
      acceptanceRate: "15%",
      status: "Active"
    },
    {
      scholarshipId: "3",
      name: "Imperial College London AI Research Scholarship",
      providerName: "Imperial College London",
      providerType: "university", 
      providerCountry: "United Kingdom",
      hostCountries: ["United Kingdom"],
      eligibleCountries: ["Global"],
      studyLevels: ["Master's", "PhD"],
      fieldCategories: ["Engineering", "Computer Science", "Research"],
      specificFields: ["Artificial Intelligence", "Data Science", "Machine Learning"],
      fundingType: "Full funding",
      fundingCurrency: "GBP",
      tuitionCoveragePercentage: "100%",
      livingAllowanceAmount: "1,800",
      livingAllowanceFrequency: "Monthly",
      totalValueMin: "50,000",
      totalValueMax: "75,000",
      applicationDeadline: "2025-10-31",
      durationValue: 3,
      durationUnit: "years",
      minGpa: "3.6",
      minWorkExperience: 1,
      leadershipRequired: true,
      languageRequirements: [{ test: "IELTS", minScore: 7.0 }],
      applicationUrl: "https://imperial.ac.uk/study/pg/fees-and-funding/scholarships",
      documentsRequired: ["CV", "Research Proposal", "References"],
      renewable: false,
      description: "Research-focused scholarship for AI and machine learning studies",
      tags: ["Research", "AI", "Innovation"],
      difficultyLevel: "Very High",
      acceptanceRate: "8%",
      status: "Active"
    },
    {
      scholarshipId: "4",
      name: "ETH Zurich Excellence Scholarship",
      providerName: "ETH Zurich",
      providerType: "university",
      providerCountry: "Switzerland",
      hostCountries: ["Switzerland"],
      eligibleCountries: ["Global"],
      studyLevels: ["Master's"],
      fieldCategories: ["Engineering", "Technology", "Sciences"],
      specificFields: ["Computer Science", "Electrical Engineering", "Data Science"],
      fundingType: "Partial funding",
      fundingCurrency: "CHF",
      tuitionCoveragePercentage: "100%",
      livingAllowanceAmount: "1,500",
      livingAllowanceFrequency: "Monthly",
      totalValueMin: "35,000",
      totalValueMax: "50,000",
      applicationDeadline: "2025-12-01",
      durationValue: 2,
      durationUnit: "years",
      minGpa: "3.8",
      minWorkExperience: 0,
      leadershipRequired: false,
      languageRequirements: [{ test: "IELTS", minScore: 7.0 }],
      applicationUrl: "https://ethz.ch/students/en/studies/financial/scholarships",
      documentsRequired: ["Transcripts", "Motivation Letter", "CV"],
      renewable: false,
      description: "Excellence scholarship for top international master's students",
      tags: ["Excellence", "STEM", "Europe"],
      difficultyLevel: "Very High",
      acceptanceRate: "6%",
      status: "Active"
    },
    {
      scholarshipId: "5",
      name: "Australia Awards Scholarship",
      providerName: "Australian Government",
      providerType: "government",
      providerCountry: "Australia",
      hostCountries: ["Australia"],
      eligibleCountries: ["Asia-Pacific", "Africa", "Middle East"],
      studyLevels: ["Bachelor's", "Master's", "PhD"],
      fieldCategories: ["All fields"],
      specificFields: ["Development Studies", "Public Policy", "Engineering", "Health"],
      fundingType: "Full funding",
      fundingCurrency: "AUD",
      tuitionCoveragePercentage: "100%",
      livingAllowanceAmount: "2,500",
      livingAllowanceFrequency: "Monthly",
      totalValueMin: "60,000",
      totalValueMax: "100,000",
      applicationDeadline: "2025-09-30",
      durationValue: 2,
      durationUnit: "years",
      minGpa: "3.0",
      minWorkExperience: 2,
      leadershipRequired: true,
      languageRequirements: [{ test: "IELTS", minScore: 6.5 }],
      applicationUrl: "https://australiaawards.gov.au",
      documentsRequired: ["Application Form", "Academic Records", "Work Experience"],
      renewable: false,
      description: "Government scholarship promoting development and regional cooperation",
      tags: ["Government", "Development", "Leadership"],
      difficultyLevel: "Moderate",
      acceptanceRate: "25%",
      status: "Active"
    }
  ];

  // Filter scholarships based on frontend criteria
  const filteredScholarships = sampleScholarships.filter(scholarship => {
    const matchesSearch = !searchTerm || 
      scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.specificFields?.some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProviderType = !selectedProviderType || selectedProviderType === 'all' || 
      scholarship.providerType === selectedProviderType;
    
    const matchesCountry = !selectedCountry || selectedCountry === 'all' ||
      scholarship.providerCountry === selectedCountry ||
      scholarship.hostCountries?.includes(selectedCountry);
    
    const matchesStudyLevel = !selectedStudyLevel || selectedStudyLevel === 'all' ||
      scholarship.studyLevels?.includes(selectedStudyLevel);
    
    const matchesFieldCategory = !selectedFieldCategory || selectedFieldCategory === 'all' ||
      scholarship.fieldCategories?.includes(selectedFieldCategory);
    
    const matchesFundingType = !selectedFundingType || selectedFundingType === 'all' ||
      scholarship.fundingType.toLowerCase().includes(selectedFundingType.toLowerCase());
    
    const matchesDifficultyLevel = !selectedDifficultyLevel || selectedDifficultyLevel === 'all' ||
      scholarship.difficultyLevel === selectedDifficultyLevel;

    return matchesSearch && matchesProviderType && matchesCountry && 
           matchesStudyLevel && matchesFieldCategory && matchesFundingType && matchesDifficultyLevel;
  });

  const scholarships = filteredScholarships;
  const filters = { 
    providerTypes: ["university", "government"], 
    countries: ["United States", "Canada", "United Kingdom", "Switzerland", "Australia"], 
    studyLevels: ["Bachelor's", "Master's", "PhD"], 
    fieldCategories: ["Engineering", "Computer Science", "Technology", "Mathematics", "Sciences"], 
    fundingTypes: ["Full funding", "Partial funding"], 
    difficultyLevels: ["Moderate", "High", "Very High"] 
  };

  const statsData = {
    totalScholarships: sampleScholarships.length,
    providers: 5,
    countries: 4,
    totalFunding: "0.0M"
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
    return "Amount varies";
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'Very High': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moderate': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedProviderType("");
    setSelectedCountry("");
    setSelectedStudyLevel("");
    setSelectedFieldCategory("");
    setSelectedFundingType("");
    setSelectedDifficultyLevel("");
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Scholarship Research Database</h1>
            <p className="text-blue-100 text-lg">
              Discover international scholarship opportunities with our comprehensive database of verified programs from governments, universities, and organizations worldwide.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{statsData.totalScholarships}</div>
                <div className="text-sm text-gray-600">Total Scholarships</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{statsData.providers}</div>
                <div className="text-sm text-gray-600">Providers</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{statsData.countries}</div>
                <div className="text-sm text-gray-600">Countries</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">${statsData.totalFunding}</div>
                <div className="text-sm text-gray-600">Total Funding</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Search & Filter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div>
                    <Input
                      placeholder="Search scholarships..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Provider Type */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto font-semibold"
                      onClick={() => toggleSection('providerType')}
                    >
                      <span className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Scholarship Type
                      </span>
                      {expandedSections.providerType ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    {expandedSections.providerType && (
                      <div className="mt-2">
                        <Select value={selectedProviderType} onValueChange={setSelectedProviderType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {filters.providerTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto font-semibold"
                      onClick={() => toggleSection('country')}
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Country
                      </span>
                      {expandedSections.country ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    {expandedSections.country && (
                      <div className="mt-2">
                        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {filters.countries.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Study Level */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto font-semibold"
                      onClick={() => toggleSection('studyLevel')}
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Study Level
                      </span>
                      {expandedSections.studyLevel ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    {expandedSections.studyLevel && (
                      <div className="mt-2">
                        <Select value={selectedStudyLevel} onValueChange={setSelectedStudyLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            {filters.studyLevels.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Field of Study */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto font-semibold"
                      onClick={() => toggleSection('fieldCategory')}
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Field of Study
                      </span>
                      {expandedSections.fieldCategory ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    {expandedSections.fieldCategory && (
                      <div className="mt-2">
                        <Select value={selectedFieldCategory} onValueChange={setSelectedFieldCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Fields</SelectItem>
                            {filters.fieldCategories.map(field => (
                              <SelectItem key={field} value={field}>{field}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Funding Type */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto font-semibold"
                      onClick={() => toggleSection('fundingType')}
                    >
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Funding Type
                      </span>
                      {expandedSections.fundingType ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    {expandedSections.fundingType && (
                      <div className="mt-2">
                        <Select value={selectedFundingType} onValueChange={setSelectedFundingType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select funding" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {filters.fundingTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Other Filters */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto font-semibold"
                      onClick={() => toggleSection('other')}
                    >
                      <span className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Other Filters
                      </span>
                      {expandedSections.other ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    {expandedSections.other && (
                      <div className="mt-2">
                        <Select value={selectedDifficultyLevel} onValueChange={setSelectedDifficultyLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Difficulty Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Difficulties</SelectItem>
                            {filters.difficultyLevels.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Separator />
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {scholarships.length} Scholarships Found
                </h2>
                {getMatchScore() > 85 && (
                  <Badge className={`px-3 py-1 ${getMatchScoreColor(getMatchScore())}`}>
                    {getMatchScore()}% Match
                  </Badge>
                )}
              </div>

              {scholarships.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No scholarships found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {selectedScholarship ? (
                    // Detailed View
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <Button 
                          variant="ghost" 
                          onClick={() => setSelectedScholarship(null)}
                          className="p-0"
                        >
                          ← Back to results
                        </Button>
                        <Badge className={getDifficultyColor(selectedScholarship.difficultyLevel)}>
                          {selectedScholarship.difficultyLevel}
                        </Badge>
                      </div>

                      <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                          <div>
                            <h1 className="text-3xl font-bold mb-2">{selectedScholarship.name}</h1>
                            <div className="flex items-center gap-4 text-gray-600">
                              <span className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                {selectedScholarship.providerName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="h-4 w-4" />
                                {selectedScholarship.providerCountry}
                              </span>
                            </div>
                          </div>

                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="requirements">Requirements</TabsTrigger>
                              <TabsTrigger value="benefits">Benefits</TabsTrigger>
                              <TabsTrigger value="application">Application</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="overview" className="space-y-4">
                              <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-gray-700">{selectedScholarship.description}</p>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Study Levels</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedScholarship.studyLevels?.map(level => (
                                      <Badge key={level} variant="secondary">{level}</Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Fields of Study</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedScholarship.specificFields?.map(field => (
                                      <Badge key={field} variant="outline">{field}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="requirements" className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium mb-3">Academic Requirements</h4>
                                  <ul className="space-y-2 text-sm">
                                    <li>• Minimum GPA: {selectedScholarship.minGpa}</li>
                                    <li>• Work Experience: {selectedScholarship.minWorkExperience || 0} years</li>
                                    <li>• Leadership: {selectedScholarship.leadershipRequired ? 'Required' : 'Not Required'}</li>
                                  </ul>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-3">Language Requirements</h4>
                                  {selectedScholarship.languageRequirements?.map((req, index) => (
                                    <p key={index} className="text-sm">
                                      {req.test}: {req.minScore} minimum
                                    </p>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-3">Required Documents</h4>
                                <ul className="grid md:grid-cols-2 gap-2">
                                  {selectedScholarship.documentsRequired?.map(doc => (
                                    <li key={doc} className="text-sm">• {doc}</li>
                                  ))}
                                </ul>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="benefits" className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium mb-3">Financial Coverage</h4>
                                  <ul className="space-y-2 text-sm">
                                    <li>• Tuition: {selectedScholarship.tuitionCoveragePercentage}</li>
                                    <li>• Living Allowance: {formatAmount(selectedScholarship)}</li>
                                    <li>• Duration: {selectedScholarship.durationValue} {selectedScholarship.durationUnit}</li>
                                    <li>• Renewable: {selectedScholarship.renewable ? 'Yes' : 'No'}</li>
                                  </ul>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-3">Additional Benefits</h4>
                                  <ul className="space-y-2 text-sm">
                                    <li>• Research opportunities</li>
                                    <li>• Networking access</li>
                                    <li>• Career development</li>
                                    <li>• Alumni network</li>
                                  </ul>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="application" className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium mb-3">Application Details</h4>
                                  <ul className="space-y-2 text-sm">
                                    <li>• Deadline: {formatDeadline(selectedScholarship.applicationDeadline)}</li>
                                    <li>• Acceptance Rate: {selectedScholarship.acceptanceRate}</li>
                                    <li>• Difficulty: {selectedScholarship.difficultyLevel}</li>
                                  </ul>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-3">Apply Now</h4>
                                  <Button asChild className="w-full">
                                    <a href={selectedScholarship.applicationUrl} target="_blank" rel="noopener noreferrer">
                                      Visit Application Portal
                                      <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>

                        <div className="space-y-6">
                          <Card className="p-4">
                            <h3 className="font-semibold mb-3">Quick Stats</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Match Score</span>
                                <Badge className={getMatchScoreColor(getMatchScore())}>
                                  {getMatchScore()}%
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Funding Type</span>
                                <span className="text-sm font-medium">{selectedScholarship.fundingType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Provider Type</span>
                                <span className="text-sm font-medium capitalize">{selectedScholarship.providerType}</span>
                              </div>
                            </div>
                          </Card>

                          <Card className="p-4">
                            <h3 className="font-semibold mb-3">Application Timeline</h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{formatDeadline(selectedScholarship.applicationDeadline)}</span>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    // List View
                    scholarships.map((scholarship) => (
                      <Card key={scholarship.scholarshipId} className="p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedScholarship(scholarship)}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{scholarship.name}</h3>
                              <Badge className={getDifficultyColor(scholarship.difficultyLevel)}>
                                {scholarship.difficultyLevel}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                {scholarship.providerName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="h-4 w-4" />
                                {scholarship.providerCountry}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDeadline(scholarship.applicationDeadline)}
                              </span>
                            </div>
                            
                            <p className="text-gray-700 mb-4">{scholarship.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {scholarship.studyLevels?.slice(0, 3).map(level => (
                                <Badge key={level} variant="secondary">{level}</Badge>
                              ))}
                              {scholarship.specificFields?.slice(0, 2).map(field => (
                                <Badge key={field} variant="outline">{field}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right ml-6">
                            <Badge className={`mb-2 ${getMatchScoreColor(getMatchScore())}`}>
                              {getMatchScore()}% Match
                            </Badge>
                            <div className="text-lg font-semibold text-gray-900">
                              {formatAmount(scholarship)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {scholarship.fundingType}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Acceptance: {scholarship.acceptanceRate}</span>
                            <span>Duration: {scholarship.durationValue} {scholarship.durationUnit}</span>
                          </div>
                          
                          <Button variant="ghost" size="sm">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}