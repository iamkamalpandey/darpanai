import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Brain,
  Sparkles,
  ChevronRight,
  Award,
  Shield,
  Cpu,
  Database,
  TrendingUp,
  Users,
  Globe,
  Zap,
  Target,
  FileText,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  BarChart3,
  ArrowUpRight,
  Star,
  Rocket
} from 'lucide-react';

interface UserStats {
  analysisCount: number;
  maxAnalyses: number;
  remainingAnalyses: number;
}

interface PlatformStats {
  totalAnalyses: string;
  totalUsers: string;
  totalCountries: string;
  documentsProcessed: string;
}

export default function ModernAIDashboard() {
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
  });

  const { data: platformStats } = useQuery<PlatformStats>({
    queryKey: ['/api/platform-stats'],
  });

  const analysisUsagePercentage = userStats 
    ? (userStats.analysisCount / userStats.maxAnalyses) * 100 
    : 0;

  const aiFeatures = [
    {
      icon: Brain,
      title: "AI Document Analysis",
      description: "Advanced machine learning for visa, COE, and offer letter processing",
      accuracy: "96.8%",
      color: "from-purple-500 to-blue-600",
      available: true,
      route: "/visa-analysis"
    },
    {
      icon: Sparkles,
      title: "Smart Scholarship Matching",
      description: "Intelligent algorithms match you with optimal funding opportunities",
      accuracy: "94.2%",
      color: "from-emerald-500 to-teal-600",
      available: true,
      route: "/scholarship-research"
    },
    {
      icon: Target,
      title: "Predictive Success Analytics",
      description: "AI-powered predictions for application success rates",
      accuracy: "92.5%",
      color: "from-orange-500 to-red-600",
      available: false,
      route: "/analytics"
    },
    {
      icon: Cpu,
      title: "Neural Language Processing",
      description: "Advanced NLP for comprehensive document understanding",
      accuracy: "98.1%",
      color: "from-blue-500 to-indigo-600",
      available: true,
      route: "/offer-letter-analysis"
    }
  ];

  const aiMetrics = [
    {
      label: "AI Processing Speed",
      value: "2.3s",
      change: "+12%",
      icon: Zap,
      trend: "up"
    },
    {
      label: "Model Accuracy",
      value: "96.8%",
      change: "+3.2%",
      icon: Target,
      trend: "up"
    },
    {
      label: "Success Predictions",
      value: "94.5%",
      change: "+5.1%",
      icon: TrendingUp,
      trend: "up"
    },
    {
      label: "User Satisfaction",
      value: "98.2%",
      change: "+1.8%",
      icon: Star,
      trend: "up"
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-6">
        {/* Hero Section with AI Branding */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 p-8 lg:p-12 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Brain className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">Darpan Intelligence</h1>
                  <p className="text-blue-100 text-lg">AI-Powered Education Intelligence Platform</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-6 w-6 text-yellow-300" />
                    <span className="font-semibold">AI Analyses Completed</span>
                  </div>
                  <p className="text-3xl font-bold">{platformStats?.totalAnalyses || "0"}</p>
                  <p className="text-blue-100 text-sm">Across {platformStats?.totalCountries || "0"} countries</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="h-6 w-6 text-green-300" />
                    <span className="font-semibold">ML Model Accuracy</span>
                  </div>
                  <p className="text-3xl font-bold">96.8%</p>
                  <p className="text-blue-100 text-sm">Continuously improving</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-6 w-6 text-purple-300" />
                    <span className="font-semibold">Global Users</span>
                  </div>
                  <p className="text-3xl font-bold">{platformStats?.totalUsers || "0"}+</p>
                  <p className="text-blue-100 text-sm">Trusted worldwide</p>
                </div>
              </div>
            </div>
            
            {/* Animated background elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* AI Features Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Features</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${feature.color} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={feature.available ? "default" : "secondary"} className="px-3 py-1">
                          {feature.available ? "Available" : "Coming Soon"}
                        </Badge>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{feature.accuracy}</p>
                          <p className="text-sm text-gray-600">Accuracy</p>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    
                    <Link href={feature.route}>
                      <Button 
                        className={`w-full bg-gradient-to-r ${feature.color} text-white border-0 hover:shadow-lg transition-all duration-300`}
                        disabled={!feature.available}
                      >
                        {feature.available ? "Launch AI Analysis" : "Notify Me"}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* AI Performance Metrics */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI Performance Metrics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-indigo-100 rounded-xl">
                        <IconComponent className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <ArrowUpRight className="h-4 w-4" />
                        {metric.change}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                    <p className="text-gray-600 text-sm">{metric.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* User Progress Section */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-indigo-600" />
                <CardTitle>Your AI Journey Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {userStats?.analysisCount || 0}
                  </div>
                  <p className="text-gray-600">AI Analyses Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {userStats?.remainingAnalyses || 0}
                  </div>
                  <p className="text-gray-600">Analyses Remaining</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round(analysisUsagePercentage)}%
                  </div>
                  <p className="text-gray-600">Usage Efficiency</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">AI Processing Quota</span>
                  <span className="font-medium">{userStats?.analysisCount || 0} / {userStats?.maxAnalyses || 0}</span>
                </div>
                <Progress value={analysisUsagePercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/consultations">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Book AI Consultation</h3>
                    <p className="text-gray-600 text-sm">Expert guidance with AI insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/my-analysis">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Analysis History</h3>
                    <p className="text-gray-600 text-sm">Review AI-generated reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl text-white">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">AI Profile Optimization</h3>
                    <p className="text-gray-600 text-sm">Enhance profile for better AI matching</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}