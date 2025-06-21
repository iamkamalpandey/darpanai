import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProfileCompletionPrompt } from "@/components/ProfileCompletionPrompt";
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
  BookOpen,
  User,
  Construction,
  GraduationCap
} from "lucide-react";
import { Link } from "wouter";
import { ConsultationForm } from "@/components/ConsultationForm";

interface UserStats {
  analysisCount: number;
  maxAnalyses: number;
}

interface PlatformStats {
  totalAnalyses: number;
  totalUsers: number;
  averageProcessingTime: string;
}

export default function Home() {
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: profileCompletion } = useQuery<{isComplete: boolean}>({
    queryKey: ['/api/user/profile-completion'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: platformStats } = useQuery<PlatformStats>({
    queryKey: ['/api/platform-stats'],
    staleTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (profileCompletion && profileCompletion.isComplete === false) {
      const timer = setTimeout(() => {
        setShowCompletionPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [profileCompletion]);

  const analysisOptions = [
    {
      title: "Visa Analysis",
      description: "AI-powered analysis of visa documents for approvals and rejections",
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      href: "/visa-analysis",
      color: "from-blue-500 to-blue-600",
      features: ["Document insights", "Approval probability", "Strategic recommendations"]
    },
    {
      title: "COE Analysis", 
      description: "Comprehensive Certificate of Enrollment document analysis",
      icon: <FileText className="w-8 h-8 text-green-600" />,
      href: "/coe-analysis",
      color: "from-green-500 to-green-600",
      features: ["Course details", "Financial breakdown", "Compliance check"]
    },
    {
      title: "Offer Letter Analysis",
      description: "Detailed analysis of university offer letters and admission documents",
      icon: <GraduationCap className="w-8 h-8 text-purple-600" />,
      href: "/offer-letter-analysis",
      color: "from-purple-500 to-purple-600",
      features: ["Scholarship matching", "Cost analysis", "Terms review"]
    },
    {
      title: "User Profile AI Analysis",
      description: "Personalized AI analysis based on your complete profile and preferences",
      icon: <User className="w-8 h-8 text-orange-600" />,
      href: "#",
      color: "from-orange-400 to-orange-600",
      features: ["Coming Q2 2025", "Profile matching", "Personalized insights"],
      comingSoon: true
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Darpan Intelligence
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Make informed education and career decisions with AI-powered document analysis
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {userStats?.analysisCount || 0}
                  </h3>
                  <p className="text-gray-600">Documents Analyzed</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {(userStats?.maxAnalyses || 0) - (userStats?.analysisCount || 0)}
                  </h3>
                  <p className="text-gray-600">Remaining Analyses</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {platformStats?.averageProcessingTime || "2-5 min"}
                  </h3>
                  <p className="text-gray-600">Avg Processing Time</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Analysis Options */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                AI-Powered Document Analysis
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the analysis type that matches your document and get instant AI insights
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analysisOptions.map((option, index) => (
                <Card 
                  key={index} 
                  className={`group relative overflow-hidden border-0 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    option.comingSoon 
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100 cursor-default' 
                      : 'bg-white/90 backdrop-blur-sm cursor-pointer hover:bg-white'
                  }`}
                >
                  {option.comingSoon && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-orange-500 text-white text-xs px-2 py-1">
                        Coming Soon
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      option.comingSoon ? 'opacity-70' : 'group-hover:scale-110'
                    } transition-transform duration-300`}>
                      {option.comingSoon ? <Construction className="w-8 h-8 text-white" /> : option.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {option.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-2 mb-6">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 flex-shrink-0"></div>
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {option.comingSoon ? (
                      <Button disabled className="w-full bg-gray-300 text-gray-600 cursor-not-allowed">
                        Under Development
                      </Button>
                    ) : (
                      <Link href={option.href}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300">
                          Start Analysis
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Platform Trust Indicators */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Trusted by Students Worldwide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {platformStats?.totalAnalyses?.toLocaleString() || "27,123+"}
                </div>
                <p className="text-gray-600">Documents Analyzed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <p className="text-gray-600">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                <p className="text-gray-600">Countries Supported</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Book Consultation
                </CardTitle>
                <CardDescription>
                  Schedule a personalized consultation with our education experts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/consultations">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Schedule Appointment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  Document Resources
                </CardTitle>
                <CardDescription>
                  Access templates and checklists for your study abroad journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/document-templates">
                  <Button variant="outline" className="w-full">
                    Browse Resources
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Completion Prompt */}
        {showCompletionPrompt && (
          <ProfileCompletionPrompt 
            open={showCompletionPrompt}
            onClose={() => setShowCompletionPrompt(false)} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}