import { useState } from "react";
import { Search, ExternalLink, Calendar, DollarSign, Users, Globe, Award, BookOpen, Clock, CheckCircle2, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/DashboardLayout";

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  country: string;
  amount: string;
  deadline: string;
  studyLevel: string;
  eligibility: string[];
  description: string;
  applicationUrl: string;
  matchScore: number;
  requirements: string[];
  benefits: string[];
  renewability: string;
  category: "merit" | "need-based" | "country-specific" | "field-specific";
}

const sampleScholarships: Scholarship[] = [
  {
    id: "1",
    name: "Australia Awards Scholarship",
    provider: "Australian Government",
    country: "Australia",
    amount: "Full tuition + AUD $31,000 annually",
    deadline: "April 30, 2025",
    studyLevel: "Masters/PhD",
    eligibility: ["Developing country citizens", "Min. 2 years work experience", "English proficiency"],
    description: "Prestigious scholarship covering full tuition, living allowance, and additional benefits for students from developing countries to study in Australia.",
    applicationUrl: "https://www.australiaawards.gov.au",
    matchScore: 95,
    requirements: ["Bachelor's degree with 60% marks", "IELTS 6.5 overall", "Work experience certificate", "Letter of support from employer"],
    benefits: ["Full tuition coverage", "Monthly stipend", "Health insurance", "Airfare", "Establishment allowance"],
    renewability: "Annual review based on academic performance",
    category: "country-specific"
  },
  {
    id: "2",
    name: "Chevening Scholarships",
    provider: "UK Government",
    country: "United Kingdom",
    amount: "Full tuition + GBP £18,000 annually",
    deadline: "November 2, 2024",
    studyLevel: "Masters",
    eligibility: ["Chevening-eligible countries", "Min. 2 years work experience", "Leadership potential"],
    description: "One-year Master's scholarship for future leaders from Chevening-eligible countries to study at any UK university.",
    applicationUrl: "https://www.chevening.org",
    matchScore: 88,
    requirements: ["Bachelor's degree", "IELTS 6.5", "2 years work experience", "3 course choices", "4 references"],
    benefits: ["Full tuition fees", "Monthly stipend", "Travel costs", "Visa application", "Networking events"],
    renewability: "One-time award for 1-year programs",
    category: "country-specific"
  },
  {
    id: "3",
    name: "STEM Excellence Scholarship",
    provider: "University of Toronto",
    country: "Canada",
    amount: "CAD $25,000 per year",
    deadline: "January 15, 2025",
    studyLevel: "Masters/PhD",
    eligibility: ["STEM field students", "GPA 3.7+", "Research experience"],
    description: "Merit-based scholarship for outstanding students pursuing STEM fields at University of Toronto.",
    applicationUrl: "https://www.utoronto.ca/scholarships",
    matchScore: 82,
    requirements: ["Bachelor's in STEM", "GPA 3.7/4.0", "Research portfolio", "2 academic references", "Statement of purpose"],
    benefits: ["Partial tuition coverage", "Research stipend", "Conference funding", "Mentorship program"],
    renewability: "Renewable up to 4 years based on performance",
    category: "field-specific"
  },
  {
    id: "4",
    name: "Gates Cambridge Scholarship",
    provider: "University of Cambridge",
    country: "United Kingdom",
    amount: "Full funding + GBP £20,000",
    deadline: "December 6, 2024",
    studyLevel: "Masters/PhD",
    eligibility: ["Non-UK citizens", "Academic excellence", "Leadership commitment"],
    description: "Highly competitive full-funding scholarship for outstanding students from outside the UK to study at Cambridge.",
    applicationUrl: "https://www.gatescambridge.org",
    matchScore: 76,
    requirements: ["Exceptional academic record", "Leadership evidence", "Commitment to improving lives", "English proficiency", "Cambridge admission"],
    benefits: ["Full tuition and fees", "Maintenance allowance", "Travel costs", "Family allowance", "Academic development"],
    renewability: "Full duration of course with annual review",
    category: "merit"
  },
  {
    id: "5",
    name: "Erasmus Mundus Joint Masters",
    provider: "European Commission",
    country: "Multiple EU Countries",
    amount: "EUR €25,000 per year",
    deadline: "Multiple deadlines",
    studyLevel: "Masters",
    eligibility: ["Third-country nationals", "Bachelor's degree", "Field-specific requirements"],
    description: "Study in multiple European countries with full funding covering tuition, travel, and living costs.",
    applicationUrl: "https://ec.europa.eu/programmes/erasmus-plus",
    matchScore: 71,
    requirements: ["Bachelor's degree", "English proficiency", "Motivation letter", "Academic transcripts", "2 references"],
    benefits: ["Full tuition coverage", "Monthly allowance", "Travel costs", "Installation costs", "Insurance"],
    renewability: "2-year program duration",
    category: "country-specific"
  }
];

export default function ScholarshipResearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("match");

  const filteredScholarships = sampleScholarships
    .filter(scholarship => {
      const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scholarship.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = selectedCountry === "all" || scholarship.country === selectedCountry;
      const matchesLevel = selectedLevel === "all" || scholarship.studyLevel.includes(selectedLevel);
      const matchesCategory = selectedCategory === "all" || scholarship.category === selectedCategory;
      
      return matchesSearch && matchesCountry && matchesLevel && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (sortBy === "amount") return parseInt(b.amount.replace(/[^\d]/g, '')) - parseInt(a.amount.replace(/[^\d]/g, ''));
      return 0;
    });

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 80) return "text-blue-600 bg-blue-50";
    if (score >= 70) return "text-orange-600 bg-orange-50";
    return "text-gray-600 bg-gray-50";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "merit": return "bg-purple-100 text-purple-800";
      case "need-based": return "bg-green-100 text-green-800";
      case "country-specific": return "bg-blue-100 text-blue-800";
      case "field-specific": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Scholarship Research Hub</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and track scholarship opportunities tailored to your academic profile and career goals
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">2,847</div>
              <div className="text-sm text-gray-600">Available Scholarships</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">$2.1B</div>
              <div className="text-sm text-gray-600">Total Funding Available</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">45</div>
              <div className="text-sm text-gray-600">Countries Covered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">89%</div>
              <div className="text-sm text-gray-600">Match Accuracy</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Scholarships
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search scholarships by name, provider, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="United Kingdom">UK</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Multiple EU Countries">EU</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Masters">Masters</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="merit">Merit-based</SelectItem>
                    <SelectItem value="need-based">Need-based</SelectItem>
                    <SelectItem value="country-specific">Country-specific</SelectItem>
                    <SelectItem value="field-specific">Field-specific</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Match Score</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredScholarships.length} scholarships found
          </h2>
          <Badge variant="outline" className="text-sm">
            Showing top matches for your profile
          </Badge>
        </div>

        {/* Scholarship Results */}
        <div className="space-y-4">
          {filteredScholarships.map((scholarship) => (
            <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">{scholarship.name}</h3>
                      <Badge className={`${getMatchScoreColor(scholarship.matchScore)} border-0`}>
                        {scholarship.matchScore}% match
                      </Badge>
                      <Badge className={getCategoryColor(scholarship.category)}>
                        {scholarship.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {scholarship.provider}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        {scholarship.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {scholarship.studyLevel}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-lg font-bold text-green-600">{scholarship.amount}</div>
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <Calendar className="h-4 w-4" />
                      Due: {scholarship.deadline}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{scholarship.description}</p>
                
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="benefits">Benefits</TabsTrigger>
                    <TabsTrigger value="application">Application</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Eligibility Criteria</h4>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.eligibility.map((criteria, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {criteria}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Renewability</h4>
                      <p className="text-sm text-gray-600">{scholarship.renewability}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="requirements" className="space-y-2">
                    <h4 className="font-medium text-gray-900">Application Requirements</h4>
                    <ul className="space-y-1">
                      {scholarship.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="benefits" className="space-y-2">
                    <h4 className="font-medium text-gray-900">Scholarship Benefits</h4>
                    <ul className="space-y-1">
                      {scholarship.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="application" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Ready to Apply?</h4>
                        <p className="text-sm text-gray-600">Visit the official scholarship portal</p>
                      </div>
                      <Button asChild>
                        <a href={scholarship.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          Apply Now
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      <Clock className="h-4 w-4" />
                      Application deadline: {scholarship.deadline}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredScholarships.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}