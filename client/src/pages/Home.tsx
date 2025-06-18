import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ConsultationForm } from "@/components/ConsultationForm";
import { CustomCTA } from "@/components/CustomCTA";
import { SystemAnnouncement } from "@/components/SystemAnnouncement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Upload, FileText, Calendar, Clock, TrendingUp, Award, Star, ArrowRight, Phone, Mail, Shield, FileCheck, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

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
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Immediately redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      setLocation('/admin');
    }
  }, [user, setLocation]);

  // Don't render user dashboard for admin users
  if (user?.role === 'admin') {
    return null;
  }
  
  // Fetch user's recent analyses
  const { data: recentAnalyses = [] } = useQuery<RecentAnalysis[]>({
    queryKey: ["/api/analyses"],
  });

  const remainingAnalyses = user ? user.maxAnalyses - user.analysisCount : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* System Announcement */}
        <SystemAnnouncement />
        
        {/* Hero Section - Personalized Welcome */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 border border-blue-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                Your comprehensive AI-powered platform for study abroad success. From document analysis to expert guidance, we simplify your journey every step of the way.
              </p>
              
              {/* Single Primary CTA */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <ConsultationForm 
                  buttonVariant="default" 
                  buttonSize="lg"
                  buttonText="Book Expert Consultation"
                  className="text-base sm:text-lg px-8 sm:px-12 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                  source="dashboard-hero"
                />
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>AI-Powered Document Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>Country-Specific Guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>Expert Consultation Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>Confidential & Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Types Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Choose Your Analysis Type
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Select the type of document you'd like to analyze. Our AI-powered system provides detailed insights and actionable recommendations.
            </p>
          </div>

          {/* Analysis Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Visa Rejection Analysis Card */}
            <Link href="/visa-analysis">
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer h-full">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Visa Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Get detailed insights into your visa documents - both approvals and rejections with key information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>AI-powered visa document analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Personalized improvement tips</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Country-specific guidance</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Get Started</span>
                      <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Enrollment Document Analysis Card */}
            <Link href="/enrollment-analysis">
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 cursor-pointer h-full">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    Enrollment Document Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Verify and analyze your university enrollment documents for accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Document authenticity check</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Compliance verification</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Institution validation</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Analyze Now</span>
                      <ArrowRight className="h-4 w-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Coming Soon Card - Placeholder for Future Analysis */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-dashed border-gray-300 cursor-default h-full opacity-75">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-600">
                  More Analysis Coming Soon
                </CardTitle>
                <CardDescription className="text-gray-500">
                  We're working on additional analysis types to support your study abroad journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Financial document analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Academic transcript review</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Language proficiency analysis</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {/* Analysis Usage */}
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Analysis Progress</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {user?.analysisCount || 0} / {user?.maxAnalyses || 3}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${user ? Math.min((user.analysisCount / user.maxAnalyses) * 100, 100) : 0}%` 
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {remainingAnalyses > 0 ? `${remainingAnalyses} remaining` : 'Limit reached'}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Recent Analysis</h3>
                <div className="text-lg font-semibold text-green-600 mb-2">
                  {recentAnalyses.length > 0 && recentAnalyses[0]?.fileName 
                    ? recentAnalyses[0].fileName.length > 20 
                      ? recentAnalyses[0].fileName.substring(0, 20) + '...'
                      : recentAnalyses[0].fileName
                    : 'No analyses yet'}
                </div>
                <Link href="/my-analysis">
                  <Button variant="outline" size="sm" className="text-xs">
                    View All History
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Access */}
            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Expert Support</h3>
                <p className="text-sm text-gray-600 mb-3">Get personalized guidance</p>
                <ConsultationForm 
                  buttonVariant="default" 
                  buttonSize="sm"
                  buttonText="Book Now"
                  className="text-xs px-4 py-2"
                  source="dashboard-overview"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <Link href="/my-analysis">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900 text-sm">My Analysis</h3>
                <p className="text-xs text-gray-500 mt-1">View history</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/consultations">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900 text-sm">Appointments</h3>
                <p className="text-xs text-gray-500 mt-1">Manage bookings</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/document-templates">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-4 text-center">
                <FileCheck className="h-8 w-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900 text-sm">Templates</h3>
                <p className="text-xs text-gray-500 mt-1">Download docs</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/document-checklist">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-4 text-center">
                <ClipboardCheck className="h-8 w-8 mx-auto mb-2 text-orange-600 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900 text-sm">Checklists</h3>
                <p className="text-xs text-gray-500 mt-1">Requirements</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Analyses Preview */}
        {recentAnalyses.length > 0 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Recent Analyses</CardTitle>
                <Link href="/my-analysis">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAnalyses.slice(0, 3).map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">
                          {analysis.fileName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(analysis.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={analysis.isPublic ? "default" : "secondary"}>
                      {analysis.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customized CTA Section for Dashboard */}
        <CustomCTA variant="dashboard" source="dashboard-cta" />

        {/* Support Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
            <p className="text-gray-600 text-sm">
              Our expert team is here to support your study abroad journey with personalized guidance and consultation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>Expert consultation available</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>Email support included</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}