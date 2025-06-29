import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ProfileCompletionPrompt } from '../components/ProfileCompletionPrompt';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Brain,
  GraduationCap,
  FileText,
  Award,
  Globe,
  Zap,
  Target,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Shield,
  Sparkles,
  ChevronRight,
  BarChart3,
  Calendar,
  MapPin,
  DollarSign
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

export default function StudentAIDashboard() {
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);



  const { data: profileCompletion } = useQuery({
    queryKey: ['/api/user/profile-completion'],
  });

  const educationServices = [
    {
      icon: FileText,
      title: "Visa Document Analysis",
      description: "Get instant AI insights on your visa application documents with success probability predictions",
      accuracy: "96.8%",
      processingTime: "2-3 seconds",
      color: "from-blue-500 to-indigo-600",
      available: true,
      route: "/visa-analysis",
      features: ["Document accuracy check", "Success probability", "Improvement suggestions"]
    },
    {
      icon: GraduationCap,
      title: "COE Certificate Review",
      description: "Comprehensive analysis of your Confirmation of Enrollment with compliance verification",
      accuracy: "94.5%",
      processingTime: "3-5 seconds",
      color: "from-emerald-500 to-teal-600",
      available: true,
      route: "/coe-analysis",
      features: ["Compliance check", "Financial breakdown", "Next steps guidance"]
    },
    {
      icon: BookOpen,
      title: "Offer Letter Intelligence",
      description: "Detailed analysis of university offer letters with scholarship opportunities",
      accuracy: "95.2%",
      processingTime: "4-6 seconds",
      color: "from-purple-500 to-pink-600",
      available: true,
      route: "/offer-letter-analysis",
      features: ["Terms analysis", "Hidden costs", "Scholarship matching"]
    },
    {
      icon: Award,
      title: "Scholarship Research",
      description: "AI-powered matching with global scholarships based on your academic profile",
      accuracy: "92.8%",
      processingTime: "5-8 seconds",
      color: "from-orange-500 to-red-600",
      available: true,
      route: "/scholarship-research",
      features: ["Profile matching", "Eligibility check", "Application deadlines"]
    }
  ];





  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 p-8 lg:p-12 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Brain className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">Welcome to Your AI Education Hub</h1>
                  <p className="text-blue-100 text-lg">Smart analysis for informed education decisions</p>
                </div>
              </div>
              

            </div>
            
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* AI Education Services */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Education Analysis</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {educationServices.map((service, index) => {
              const IconComponent = service.icon;
              
              if (!service.available) {
                return (
                  <Card key={index} className="group relative overflow-hidden border-0 shadow-lg opacity-60">
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5`}></div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${service.color} text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-2">Coming Soon</Badge>
                          <div className="text-sm text-gray-600">
                            <div className="font-bold text-lg text-gray-900">{service.accuracy}</div>
                            <div>Accuracy</div>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {service.processingTime}
                        </div>
                        <Button 
                          className={`bg-gradient-to-r ${service.color} text-white border-0 opacity-50`}
                          disabled
                        >
                          Coming Soon
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              
              return (
                <Link key={index} href={service.route} className="block">
                  <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${service.color} text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="mb-2">Available</Badge>
                          <div className="text-sm text-gray-600">
                            <div className="font-bold text-lg text-gray-900">{service.accuracy}</div>
                            <div>Accuracy</div>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {service.processingTime}
                        </div>
                        <Button 
                          className={`bg-gradient-to-r ${service.color} text-white border-0 hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                        >
                          Start Analysis
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>



        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/consultations">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Book Consultation</h3>
                    <p className="text-gray-600 text-sm">Get personalized guidance from education experts</p>
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
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">My Analysis History</h3>
                    <p className="text-gray-600 text-sm">Review your previous document analyses</p>
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
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Complete Profile</h3>
                    <p className="text-gray-600 text-sm">Enhance your profile for better AI matching</p>
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