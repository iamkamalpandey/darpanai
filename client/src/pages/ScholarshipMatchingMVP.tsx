import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Filter, Star, MapPin, Calendar, DollarSign, GraduationCap, 
  Award, Globe, Users, Clock, BookOpen, TrendingUp, Heart, ExternalLink,
  ChevronDown, ChevronUp, Target, Lightbulb, CheckCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

// Mock user profile data
const userProfile = {
  name: "Kamal Pandey",
  academicLevel: "Bachelor's",
  fieldOfStudy: "Computer Science",
  interestedCourse: "Master's in AI/ML",
  preferredCountries: ["United States", "Canada", "United Kingdom"],
  budgetRange: "$50,000 - $100,000",
  nationality: "Indian",
  gpa: 3.7,
  languageTests: [
    { test: "IELTS", score: 7.5 }
  ]
};

// Mock scholarship data with detailed information
const scholarshipDatabase = [
  {
    id: 1,
    name: "MIT Graduate Fellowship",
    provider: "Massachusetts Institute of Technology",
    country: "United States",
    flag: "🇺🇸",
    amount: "$75,000",
    currency: "USD",
    type: "Full Funding",
    deadline: "2025-12-15",
    level: ["Master's", "PhD"],
    fields: ["Computer Science", "Engineering", "Technology"],
    description: "Prestigious fellowship for outstanding graduate students in STEM fields",
    requirements: {
      gpa: 3.5,
      tests: ["GRE", "TOEFL/IELTS"],
      experience: "Research experience preferred"
    },
    benefits: ["Full tuition", "Monthly stipend $3,000", "Health insurance", "Research funding"],
    matchScore: 95,
    matchReasons: [
      "Perfect field match - Computer Science",
      "Academic level progression (Bachelor's → Master's)",
      "Strong GPA requirement match (3.7 vs 3.5 required)",
      "Language test satisfied (IELTS 7.5)",
      "Preferred country: United States"
    ],
    difficulty: "High",
    acceptance: "5%",
    personalizedInsights: [
      "Your GPA (3.7) exceeds the minimum requirement",
      "Consider taking GRE for stronger application",
      "Your IELTS score meets requirements"
    ]
  },
  {
    id: 2,
    name: "Waterloo International Excellence Scholarship",
    provider: "University of Waterloo",
    country: "Canada",
    flag: "🇨🇦",
    amount: "$45,000",
    currency: "CAD",
    type: "Partial Funding",
    deadline: "2026-01-31",
    level: ["Master's"],
    fields: ["Computer Science", "Mathematics", "Engineering"],
    description: "Supporting international students pursuing advanced degrees in STEM",
    requirements: {
      gpa: 3.3,
      tests: ["IELTS/TOEFL"],
      experience: "Academic excellence"
    },
    benefits: ["Tuition assistance", "Research opportunities", "Co-op program access"],
    matchScore: 88,
    matchReasons: [
      "Strong field alignment - Computer Science",
      "Preferred country: Canada",
      "Academic progression match",
      "GPA exceeds requirements"
    ],
    difficulty: "Medium",
    acceptance: "15%",
    personalizedInsights: [
      "Excellent fit for your academic background",
      "Co-op program aligns with practical experience goals",
      "Lower competition than US universities"
    ]
  },
  {
    id: 3,
    name: "Imperial College London AI Scholarship",
    provider: "Imperial College London",
    country: "United Kingdom", 
    flag: "🇬🇧",
    amount: "£35,000",
    currency: "GBP",
    type: "Full Funding",
    deadline: "2025-11-30",
    level: ["Master's"],
    fields: ["Artificial Intelligence", "Computer Science", "Machine Learning"],
    description: "Specialized funding for AI and Machine Learning master's programs",
    requirements: {
      gpa: 3.6,
      tests: ["IELTS"],
      experience: "Programming portfolio"
    },
    benefits: ["Full tuition", "Living allowance", "Industry connections", "Research projects"],
    matchScore: 92,
    matchReasons: [
      "Perfect course match - AI/ML specialization",
      "Preferred country: United Kingdom",
      "Strong academic requirements alignment",
      "Field-specific scholarship"
    ],
    difficulty: "High",
    acceptance: "8%",
    personalizedInsights: [
      "Directly matches your AI/ML interests",
      "Your academic background is highly relevant",
      "Strong industry connections in London tech scene"
    ]
  },
  {
    id: 4,
    name: "ETH Zurich Excellence Masters Scholarship",
    provider: "ETH Zurich",
    country: "Switzerland",
    flag: "🇨🇭",
    amount: "€50,000",
    currency: "EUR",
    type: "Full Funding",
    deadline: "2025-12-31",
    level: ["Master's"],
    fields: ["Computer Science", "Data Science", "Robotics"],
    description: "Merit-based scholarship for exceptional international students",
    requirements: {
      gpa: 3.8,
      tests: ["IELTS/TOEFL"],
      experience: "Academic excellence"
    },
    benefits: ["Full coverage", "Research opportunities", "Industry partnerships"],
    matchScore: 78,
    matchReasons: [
      "Strong STEM focus",
      "Academic excellence alignment",
      "Research opportunities"
    ],
    difficulty: "Very High",
    acceptance: "3%",
    personalizedInsights: [
      "Highly competitive but excellent reputation",
      "Strong in AI/ML research",
      "Consider as reach option"
    ]
  },
  {
    id: 5,
    name: "Australia Awards Scholarship",
    provider: "Australian Government",
    country: "Australia",
    flag: "🇦🇺",
    amount: "$60,000",
    currency: "AUD",
    type: "Full Funding",
    deadline: "2026-04-30",
    level: ["Master's", "PhD"],
    fields: ["All Fields", "Technology", "Innovation"],
    description: "Government scholarship promoting education and development partnerships",
    requirements: {
      gpa: 3.0,
      tests: ["IELTS"],
      experience: "Leadership potential"
    },
    benefits: ["Full tuition", "Living allowance", "Travel allowance", "Health cover"],
    matchScore: 75,
    matchReasons: [
      "Government-backed reliability",
      "Broad field acceptance",
      "Strong support system"
    ],
    difficulty: "Medium",
    acceptance: "12%",
    personalizedInsights: [
      "Good safety option with strong support",
      "Excellent for career development",
      "Growing tech industry in Australia"
    ]
  }
];

const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AU", name: "Australia", flag: "🇦🇺" }
];

const fundingTypes = ["Full Funding", "Partial Funding", "Tuition Only", "Living Allowance"];
const difficultyLevels = ["Low", "Medium", "High", "Very High"];

export default function ScholarshipMatchingMVP() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedFunding, setSelectedFunding] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedScholarships, setSavedScholarships] = useState<number[]>([]);

  // Filter and sort scholarships
  const filteredScholarships = useMemo(() => {
    let filtered = scholarshipDatabase.filter(scholarship => {
      const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scholarship.fields.some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCountry = !selectedCountry || scholarship.country === selectedCountry;
      const matchesFunding = !selectedFunding || scholarship.type === selectedFunding;
      const matchesDifficulty = !selectedDifficulty || scholarship.difficulty === selectedDifficulty;

      return matchesSearch && matchesCountry && matchesFunding && matchesDifficulty;
    });

    // Sort by match score (highest first)
    return filtered.sort((a, b) => b.matchScore - a.matchScore);
  }, [searchTerm, selectedCountry, selectedFunding, selectedDifficulty]);

  const toggleSaveScholarship = (id: number) => {
    setSavedScholarships(prev => 
      prev.includes(id) 
        ? prev.filter(scholarshipId => scholarshipId !== id)
        : [...prev, id]
    );
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 80) return "text-blue-600 bg-blue-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Very High": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Personalized Scholarship Matching
              </h1>
              <p className="text-gray-600 mt-2">
                AI-powered recommendations tailored for {userProfile.name}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Match Quality</div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(filteredScholarships.reduce((acc, s) => acc + s.matchScore, 0) / filteredScholarships.length)}%
              </div>
            </div>
          </div>

          {/* User Profile Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{userProfile.name}</h3>
                  <p className="text-gray-600">{userProfile.academicLevel} in {userProfile.fieldOfStudy}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-gray-500">Target Course</Label>
                  <p className="font-medium">{userProfile.interestedCourse}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Preferred Countries</Label>
                  <p className="font-medium">{userProfile.preferredCountries.slice(0, 2).join(', ')}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Budget Range</Label>
                  <p className="font-medium">{userProfile.budgetRange}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Academic Standing</Label>
                  <p className="font-medium">GPA {userProfile.gpa} | IELTS {userProfile.languageTests[0].score}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search scholarships, universities, or fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label>Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Countries</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Funding Type</Label>
                  <Select value={selectedFunding} onValueChange={setSelectedFunding}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {fundingTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Difficulty</Label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      {difficultyLevels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {filteredScholarships.length} Matching Scholarships
            </h2>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              Ranked by Compatibility
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            Sorted by match score
          </div>
        </div>

        {/* Scholarship Cards */}
        <div className="grid gap-6">
          {filteredScholarships.map((scholarship, index) => (
            <Card key={scholarship.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{scholarship.flag}</span>
                      <div>
                        <CardTitle className="text-xl text-gray-900">
                          {scholarship.name}
                        </CardTitle>
                        <p className="text-gray-600">{scholarship.provider}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <Badge className={`${getMatchScoreColor(scholarship.matchScore)} border-0 font-semibold`}>
                        <Star className="w-3 h-3 mr-1" />
                        {scholarship.matchScore}% Match
                      </Badge>
                      <Badge className={getDifficultyColor(scholarship.difficulty)}>
                        {scholarship.difficulty}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {scholarship.acceptance} acceptance
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {scholarship.amount}
                    </div>
                    <div className="text-sm text-gray-500">
                      {scholarship.type}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSaveScholarship(scholarship.id)}
                      className="mt-2"
                    >
                      <Heart 
                        className={`w-4 h-4 ${savedScholarships.includes(scholarship.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="benefits">Benefits</TabsTrigger>
                    <TabsTrigger value="insights">Personal Insights</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4">
                    <div className="space-y-4">
                      <p className="text-gray-700">{scholarship.description}</p>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            <strong>Deadline:</strong> {new Date(scholarship.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            <strong>Level:</strong> {scholarship.level.join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            <strong>Fields:</strong> {scholarship.fields.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Why This Matches You:
                        </Label>
                        <div className="space-y-1">
                          {scholarship.matchReasons.map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="requirements" className="mt-4">
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Minimum GPA</Label>
                          <p className="text-lg font-semibold text-gray-700">{scholarship.requirements.gpa}</p>
                          <p className="text-xs text-green-600">✓ Your GPA: {userProfile.gpa}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Required Tests</Label>
                          <p className="text-sm text-gray-700">{scholarship.requirements.tests.join(', ')}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Additional Requirements</Label>
                        <p className="text-sm text-gray-700">{scholarship.requirements.experience}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="benefits" className="mt-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      {scholarship.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="insights" className="mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        <Label className="font-medium">Personalized Recommendations</Label>
                      </div>
                      {scholarship.personalizedInsights.map((insight, idx) => (
                        <div key={idx} className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                          <p className="text-sm text-gray-700">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Save for Later
                    </Button>
                    <Button size="sm" className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Apply Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredScholarships.length === 0 && (
          <Card className="text-center p-12">
            <CardContent>
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships match your filters</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCountry('');
                  setSelectedFunding('');
                  setSelectedDifficulty('');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}