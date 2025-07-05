import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Globe, 
  Calendar, 
  DollarSign, 
  GraduationCap, 
  Users, 
  FileText, 
  Star,
  Heart,
  BookOpen,
  Award,
  Clock,
  MapPin,
  Target,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

interface ScholarshipDetailsProps {
  id: string;
}

export default function ScholarshipDetails() {
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);

  // Fetch scholarship details
  const { data: scholarship, isLoading } = useQuery({
    queryKey: ['/api/scholarships', id],
    enabled: !!id
  });

  // Mock data for demo - replace with actual API call
  const scholarshipData = {
    id: 1,
    name: "Fulbright Foreign Student Program",
    provider: {
      name: "U.S. Department of State",
      country: "United States",
      website: "https://fulbrightprogram.org"
    },
    description: "The Fulbright Foreign Student Program enables graduate students, young professionals and artists from abroad to study and conduct research in the United States.",
    amount: "$25,000 - $45,000",
    currency: "USD",
    deadline: "2024-10-15",
    eligibility: [
      "Bachelor's degree or equivalent",
      "English proficiency (TOEFL/IELTS)",
      "Academic excellence",
      "Leadership potential",
      "Non-U.S. citizen"
    ],
    requirements: [
      "Completed online application",
      "Academic transcripts",
      "English language test scores",
      "Three letters of recommendation",
      "Personal statement",
      "Study/research proposal"
    ],
    benefits: [
      "Full tuition coverage",
      "Monthly living stipend",
      "Health insurance",
      "Travel allowance",
      "Professional development opportunities",
      "Cultural exchange programs"
    ],
    applicationProcess: [
      "Submit online application",
      "Initial screening by local Fulbright commission",
      "Interview (if selected)",
      "Final selection by Fulbright committee",
      "Pre-departure orientation"
    ],
    countries: ["United States"],
    studyLevels: ["Master's", "PhD"],
    fields: ["All fields"],
    difficulty: "High",
    acceptanceRate: "15%",
    totalApplicants: "150,000+",
    matchScore: 92,
    personalInsights: [
      "Your Computer Science background aligns perfectly with STEM priorities",
      "Your Nepal origin makes you eligible for this program",
      "Your academic excellence (3.8+ GPA) meets their standards",
      "Apply early - deadline is approaching in 3 months"
    ]
  };

  const handleSaveScholarship = async () => {
    setIsSaved(!isSaved);
    // API call to save/unsave scholarship
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/scholarship-hub" className="text-gray-600 hover:text-gray-900">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hub
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Scholarship Hub</span>
              <span>/</span>
              <span className="text-gray-900">{scholarshipData.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {scholarshipData.provider.country}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {scholarshipData.difficulty} Difficulty
                  </Badge>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">{scholarshipData.name}</h1>
                <p className="text-lg text-blue-100 mb-6">{scholarshipData.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>{scholarshipData.amount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {new Date(scholarshipData.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{scholarshipData.acceptanceRate} acceptance rate</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">{scholarshipData.matchScore}%</div>
                  <div className="text-sm text-blue-100">Match Score</div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveScholarship}
                    variant={isSaved ? "secondary" : "outline"}
                    className={isSaved ? "bg-red-100 text-red-700 border-red-200" : "bg-white text-gray-900 border-white"}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                  
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    asChild
                  >
                    <a href={scholarshipData.provider.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Apply Now
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="application">Application</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      About This Scholarship
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      {scholarshipData.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold text-gray-900">{scholarshipData.amount}</div>
                        <div className="text-sm text-gray-600">Funding Amount</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="font-semibold text-gray-900">{scholarshipData.acceptanceRate}</div>
                        <div className="text-sm text-gray-600">Acceptance Rate</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="font-semibold text-gray-900">{scholarshipData.totalApplicants}</div>
                        <div className="text-sm text-gray-600">Total Applicants</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      Benefits & Coverage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {scholarshipData.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Eligibility Criteria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scholarshipData.eligibility.map((criterion, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{criterion}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Required Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scholarshipData.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="application" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Application Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scholarshipData.applicationProcess.map((step, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700">{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                      <Calendar className="w-5 h-5" />
                      Important Deadline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-yellow-800">
                      Application deadline: <strong>{new Date(scholarshipData.deadline).toLocaleDateString()}</strong>
                    </p>
                    <p className="text-sm text-yellow-700 mt-2">
                      Apply early to increase your chances. Late applications are typically not accepted.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Personalized Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scholarshipData.personalInsights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                          <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Why This Matches You</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-3xl font-bold text-green-600">{scholarshipData.matchScore}%</div>
                      <div>
                        <div className="text-sm text-gray-600">Match Score</div>
                        <div className="text-green-600 font-medium">Excellent Match</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${scholarshipData.matchScore}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Provider Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Organization</div>
                  <div className="font-medium">{scholarshipData.provider.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Country</div>
                  <div className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {scholarshipData.provider.country}
                  </div>
                </div>
                <Separator />
                <Button asChild className="w-full">
                  <a href={scholarshipData.provider.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Official Website
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  Study Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Study Levels</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {scholarshipData.studyLevels.map((level, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Fields of Study</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {scholarshipData.fields.map((field, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Countries</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {scholarshipData.countries.map((country, index) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleSaveScholarship}
                  variant={isSaved ? "secondary" : "outline"}
                  className="w-full"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Remove from Collection' : 'Add to Collection'}
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Star className="w-4 h-4 mr-2" />
                  Add to Watchlist
                </Button>

                <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                  <a href={scholarshipData.provider.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Start Application
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}