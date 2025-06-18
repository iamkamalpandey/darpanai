import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ConsultationForm } from "@/components/ConsultationForm";
import { SystemAnnouncement } from "@/components/SystemAnnouncement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Upload, FileText, Calendar, Clock, TrendingUp, Award, Star, ArrowRight, Phone, Mail } from "lucide-react";
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
        
        {/* Hero Section - Lead Generation Focused */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 border border-blue-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                Simplifying Your Study Abroad Journey
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                Comprehensive AI-powered analysis for visa rejections, enrollment documents, and personalized guidance for study abroad success
              </p>
              
              {/* Primary CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
                <Link href="/visa-analysis" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3">
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Analyze Rejection Letter
                  </Button>
                </Link>
                <Link href="/enrollment-analysis" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Analyze Enrollment Document
                  </Button>
                </Link>
                <ConsultationForm 
                  buttonVariant="secondary" 
                  buttonSize="lg"
                  buttonText="Book Consultation"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3"
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

        {/* User Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 w-full min-w-0 auto-rows-fr">
          {/* Usage Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Analyses Used</span>
                  <Badge variant="secondary">
                    {user?.analysisCount || 0} / {user?.maxAnalyses || 3}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${user ? Math.min((user.analysisCount / user.maxAnalyses) * 100, 100) : 0}%` 
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {remainingAnalyses > 0 ? (
                    <>You have <span className="font-semibold text-green-600">{remainingAnalyses} analyses</span> remaining</>
                  ) : (
                    <span className="text-orange-600">Analysis limit reached</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/analyzer">
                  <Button variant="outline" className="w-full justify-start" disabled={remainingAnalyses <= 0}>
                    <FileText className="h-4 w-4 mr-2" />
                    New Analysis
                    {remainingAnalyses <= 0 && <span className="ml-auto text-xs text-orange-500">Limit reached</span>}
                  </Button>
                </Link>
                <Link href="/history">
                  <Button variant="secondary" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </Link>
                <ConsultationForm 
                  buttonVariant="outline" 
                  buttonText="Book Consultation"
                  className="w-full justify-start"
                />
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Expert Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Get personalized guidance from visa experts
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>Phone Consultation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>Email Support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Flexible Scheduling</span>
                  </div>
                </div>
                <ConsultationForm 
                  buttonVariant="default" 
                  buttonText="Schedule Now"
                  buttonSize="sm"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {recentAnalyses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>Your latest document analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAnalyses.slice(0, 3).map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{analysis.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(analysis.createdAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={analysis.isPublic ? "default" : "secondary"}>
                        {analysis.isPublic ? "Public" : "Private"}
                      </Badge>
                      <Link href="/history">
                        <Button variant="secondary" size="sm">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {recentAnalyses.length > 3 && (
                <div className="mt-4">
                  <Link href="/history">
                    <Button variant="outline" className="w-full">
                      View All Analyses
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Process Overview - Lead Education */}
        <Card>
          <CardHeader>
            <CardTitle>How Our Process Works</CardTitle>
            <CardDescription>Simple steps to improve your visa application success</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full min-w-0">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Upload Document</h3>
                <p className="text-sm text-gray-600">
                  Upload your visa rejection letter in PDF, JPG, or PNG format
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  Our advanced AI identifies specific rejection reasons and patterns
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Expert Guidance</h3>
                <p className="text-sm text-gray-600">
                  Get personalized recommendations and optional expert consultation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA Section */}
        <div className="bg-gray-50 rounded-xl p-8 text-center border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Improve Your Visa Application?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of successful applicants who used our AI-powered analysis and expert guidance to strengthen their visa applications.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {remainingAnalyses > 0 ? (
              <Link href="/analyzer">
                <Button size="lg" className="px-8">
                  <Upload className="h-5 w-5 mr-2" />
                  Start Free Analysis
                </Button>
              </Link>
            ) : (
              <ConsultationForm 
                buttonSize="lg"
                buttonText="Book Expert Consultation"
                className="px-8"
              />
            )}
            <ConsultationForm 
              buttonVariant="outline" 
              buttonSize="lg"
              buttonText="Schedule Consultation"
              className="px-8"
            />
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Secure & confidential • Expert support available
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}