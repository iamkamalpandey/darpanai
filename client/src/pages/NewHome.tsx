import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Shield, 
  FileText, 
  GraduationCap, 
  Search, 
  User, 
  Calendar,
  BookOpen,
  TrendingUp,
  Zap,
  ChevronRight,
  Play,
  CheckCircle,
  Award,
  Globe,
  Brain
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";

interface UserStats {
  analysisCount: number;
  maxAnalyses: number;
  remainingAnalyses: number;
}

interface PlatformStats {
  totalAnalyses: string;
  totalUsers: string;
  documentsProcessed: string;
  successRate: string;
}

export default function NewHome() {
  const { user } = useAuth();
  
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    enabled: !!user
  });

  const { data: platformStats } = useQuery<PlatformStats>({
    queryKey: ['/api/platform-stats']
  });

  // Smart analysis recommendations
  const analysisServices = [
    {
      id: "visa",
      title: "Visa Analysis",
      description: "Transform uncertainty into clarity",
      subtitle: "Get instant insights on visa approvals, rejections, and strategic next steps",
      icon: <Shield className="w-6 h-6" />,
      href: "/visa-analysis",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      features: ["Success probability", "Risk assessment", "Strategic guidance"],
      processingTime: "2-3 min",
      accuracy: "96%",
      available: true
    },
    {
      id: "coe",
      title: "COE Analysis", 
      description: "Navigate enrollment with confidence",
      subtitle: "Comprehensive analysis of Certificate of Enrollment documents",
      icon: <FileText className="w-6 h-6" />,
      href: "/coe-analysis",
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      features: ["Course verification", "Financial breakdown", "Compliance check"],
      processingTime: "1-2 min",
      accuracy: "98%",
      available: true
    },
    {
      id: "offer",
      title: "Offer Letter Analysis",
      description: "Make informed decisions",
      subtitle: "Deep analysis of admission offers with scholarship matching",
      icon: <GraduationCap className="w-6 h-6" />,
      href: "/offer-letter-analysis",
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      features: ["Scholarship finder", "Cost optimization", "Terms analysis"],
      processingTime: "3-5 min",
      accuracy: "94%",
      available: true
    },
    {
      id: "scholarships",
      title: "Scholarship Research",
      description: "Discover your funding opportunities",
      subtitle: "AI-powered matching with global scholarship database",
      icon: <Search className="w-6 h-6" />,
      href: "/scholarship-research",
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-50 to-amber-100",
      features: ["5,000+ scholarships", "Smart matching", "Deadline tracking"],
      processingTime: "Instant",
      accuracy: "92%",
      available: true
    }
  ];

  const upcomingFeatures = [
    {
      title: "Profile AI Analysis",
      description: "Personalized recommendations based on your complete academic profile",
      timeline: "Q2 2025",
      icon: <User className="w-5 h-5" />
    },
    {
      title: "SOP Analysis",
      description: "AI-powered Statement of Purpose review and optimization",
      timeline: "Q3 2025", 
      icon: <BookOpen className="w-5 h-5" />
    }
  ];

  const quickActions = [
    {
      title: "Book Consultation",
      description: "Get personalized guidance from education experts",
      icon: <Calendar className="w-5 h-5" />,
      href: "/appointments",
      color: "text-blue-600"
    },
    {
      title: "My Analysis History",
      description: "Review all your previous document analyses",
      icon: <TrendingUp className="w-5 h-5" />,
      href: "/analysis-history",
      color: "text-emerald-600"
    },
    {
      title: "Profile Completion",
      description: "Complete your profile for better recommendations",
      icon: <User className="w-5 h-5" />,
      href: "/profile",
      color: "text-purple-600"
    }
  ];

  const usageProgress = userStats ? (userStats.analysisCount / userStats.maxAnalyses) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          
          {/* Hero Section */}
          <div className="mb-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-6">
                <Brain className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">AI-Powered Intelligence</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Your education journey,
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> simplified</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                Make confident decisions with AI-powered document analysis, 
                scholarship discovery, and personalized guidance
              </p>

              {/* Platform Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{platformStats?.totalAnalyses || '27,000'}+ documents analyzed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span>{platformStats?.successRate || '96'}% accuracy rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-500" />
                  <span>50+ countries supported</span>
                </div>
              </div>
            </div>

            {/* User Stats Dashboard */}
            {userStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        Active
                      </Badge>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                      {userStats.analysisCount}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">Documents Analyzed</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Usage</span>
                        <span>{userStats.analysisCount}/{userStats.maxAnalyses}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${usageProgress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                        Available
                      </Badge>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                      {userStats.remainingAnalyses}
                    </h3>
                    <p className="text-gray-600 text-sm">Remaining Credits</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                        Success
                      </Badge>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                      96%
                    </h3>
                    <p className="text-gray-600 text-sm">Accuracy Rate</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Main Analysis Services */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Intelligent analysis for every document
              </h2>
              <p className="text-lg text-gray-600">
                Upload, analyze, and get actionable insights in minutes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {analysisServices.map((service) => (
                <Card key={service.id} className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${service.gradient}`} />
                  
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 bg-gradient-to-br ${service.bgGradient} rounded-2xl flex items-center justify-center text-gray-700 group-hover:scale-110 transition-transform duration-300`}>
                        {service.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Accuracy</div>
                        <div className="text-sm font-semibold text-gray-700">{service.accuracy}</div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-base font-medium text-gray-700 mb-2">
                      {service.description}
                    </p>
                    <p className="text-sm text-gray-600 mb-6">
                      {service.subtitle}
                    </p>

                    <div className="space-y-3 mb-6">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {service.processingTime}
                        </div>
                      </div>
                      
                      <Link href={service.href}>
                        <Button className={`bg-gradient-to-r ${service.gradient} hover:opacity-90 transition-all duration-300 group`}>
                          Start Analysis
                          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className="group cursor-pointer bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {action.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What's next</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingFeatures.map((feature, index) => (
                <Card key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-600">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {feature.title}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {feature.timeline}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}