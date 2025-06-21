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
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Document Analysis Services
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Get professional AI-powered analysis for your study abroad documents
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {analysisOptions.filter(option => !option.comingSoon).map((option, index) => (
                <Link key={index} href={option.href}>
                  <Card className="group relative overflow-hidden border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white cursor-pointer h-full">
                    <CardHeader className="text-center pb-6">
                      <div className={`w-20 h-20 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300`}>
                        {option.icon}
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                        {option.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-base leading-relaxed">
                        {option.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <ul className="space-y-3 mb-8">
                        {option.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-700">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-1.5 flex-shrink-0"></div>
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 group-hover:scale-105 transition-all duration-300">
                        Start Analysis
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
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