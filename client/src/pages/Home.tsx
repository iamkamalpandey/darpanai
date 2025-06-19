import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  Shield, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Calendar, 
  Clock,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  Brain,
  Target,
  BookOpen
} from "lucide-react";
import { Link } from "wouter";
import { ConsultationForm } from "@/components/ConsultationForm";

interface UserStats {
  analysisCount: number;
  maxAnalyses: number;
  lastAnalysisDate?: string;
}

interface RecentAnalysis {
  id: number;
  fileName: string;
  createdAt: string;
  isPublic: boolean;
}

export default function Home() {
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    staleTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    enabled: !!user,
    staleTime: 15 * 60 * 1000,
    refetchOnMount: false
  });

  const { data: recentAnalyses } = useQuery<RecentAnalysis[]>({
    queryKey: ['/api/analyses/recent'],
    enabled: !!user,
    staleTime: 15 * 60 * 1000,
    refetchOnMount: false
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-20">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-3 bg-blue-100 px-4 py-2 rounded-full mb-6">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Powered by Advanced AI</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Turn Your Document Analysis Into 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Success</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Make informed education and career decisions with AI-powered document analysis. 
                Get expert insights on visa documents, offer letters, and critical academic paperwork.
              </p>
            </div>

            {/* CTA Buttons for public users */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-10">
              <Link href="/auth">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Upload className="h-5 w-5 mr-2" />
                  Get Document Analysis
                </Button>
              </Link>
              <ConsultationForm 
                buttonVariant="outline" 
                buttonSize="lg"
                buttonText="Speak with Expert"
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-4 border-2 hover:bg-gray-50 transition-all duration-300"
                source="landing-hero"
              />
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>5K+ Documents Analyzed</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>90% Success Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span>50+ Countries Supported</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span>24/7 AI Analysis</span>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 lg:p-8 border border-indigo-100 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Make Informed Education and Career Decisions
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Analyze every critical document with AI-powered insights for your academic and career journey.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Visa Document Analysis</h3>
                <p className="text-sm text-gray-600">Comprehensive analysis of visa applications, approvals, and rejections with actionable insights.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Academic Document Review</h3>
                <p className="text-sm text-gray-600">Detailed analysis of offer letters, COE certificates, I-20 forms, and university documents.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Expert Consultation</h3>
                <p className="text-sm text-gray-600">Connect with education and career experts for personalized guidance and strategic planning.</p>
              </div>
            </div>

            <div className="text-center">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Start Your Analysis Journey
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 lg:p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-blue-100 text-lg">
                Your Document Analysis Dashboard - Make Informed Education and Career Decisions
              </p>
            </div>
            
            {userStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userStats.analysisCount}</div>
                  <div className="text-xs text-blue-200">Documents Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-300">{userStats.maxAnalyses - userStats.analysisCount}</div>
                  <div className="text-xs text-blue-200">Credits Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">
                    {userStats.lastAnalysisDate ? new Date(userStats.lastAnalysisDate).toLocaleDateString() : 'Never'}
                  </div>
                  <div className="text-xs text-blue-200">Last Analysis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-300">AI</div>
                  <div className="text-xs text-blue-200">Available 24/7</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions for Authenticated Users */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Your Document Analysis Options
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Choose the type of document you want analyzed to get specific insights for your academic journey.
            </p>
          </div>

          {/* Analysis Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Visa & Immigration Analysis */}
            <Link href="/visa-analysis">
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">Visa & Immigration Analysis</CardTitle>
                  <CardDescription>Upload visa documents, letters, or SOPs for detailed analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Start Analysis
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* COE & University Analysis */}
            <Link href="/enrollment-analysis">
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 cursor-pointer">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">COE & University Analysis</CardTitle>
                  <CardDescription>Upload COE certificates, I-20 forms, or admission letters for detailed review</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Start Analysis
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Analysis History */}
        {recentAnalyses && recentAnalyses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Recent Analysis</h3>
              <Link href="/my-analysis">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAnalyses.slice(0, 3).map((analysis) => (
                <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium truncate">{analysis.fileName}</CardTitle>
                      <Badge variant={analysis.isPublic ? "default" : "secondary"} className="text-xs">
                        {analysis.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Expert Consultation CTA */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Need Expert Guidance?</h3>
            <p className="text-gray-600 mb-4">
              Connect with our education and career experts for personalized consultation and strategic planning.
            </p>
            <ConsultationForm 
              buttonText="Book Free Consultation"
              source="dashboard-cta"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}