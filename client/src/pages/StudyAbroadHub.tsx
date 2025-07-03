import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Link } from 'wouter';
import { 
  FileText, CheckCircle, Activity, MapPin, GraduationCap, TrendingUp,
  Globe, Target, Clock, Star, ArrowRight, Brain, Sparkles, Award, Calendar
} from 'lucide-react';

export default function StudyAbroadHub() {
  const applicationFeatures = [
    {
      id: 'study-abroad-applications',
      title: 'Study Abroad Applications',
      description: 'Complete application management system for international education',
      href: '/student-applications',
      icon: <FileText className="w-6 h-6" />,
      features: ['Multi-step application process', 'Document management', 'Status tracking'],
      status: 'active',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'profile-based-application',
      title: 'Profile-Based Application',
      description: 'Smart applications using your existing profile data',
      href: '/profile-based-application',
      icon: <CheckCircle className="w-6 h-6" />,
      features: ['Auto-fill from profile', 'Instant submission', 'Profile optimization'],
      status: 'active',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'smart-application-tracker',
      title: 'Smart Application Tracker',
      description: 'Track all your applications with intelligent insights',
      href: '/smart-application-tracker',
      icon: <Activity className="w-6 h-6" />,
      features: ['Real-time tracking', 'Status updates', 'Performance analytics'],
      status: 'active',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'ai-study-destination',
      title: 'AI Study Destination Analysis',
      description: 'Get personalized country and university recommendations',
      href: '/personalized-destination-analysis',
      icon: <MapPin className="w-6 h-6" />,
      features: ['AI-powered matching', 'Country analysis', 'Cost comparison'],
      status: 'active',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      id: 'university-recommendations',
      title: 'University Recommendations',
      description: 'Comprehensive university matching based on your profile',
      href: '/assessment',
      icon: <GraduationCap className="w-6 h-6" />,
      features: ['Academic matching', 'Requirements analysis', 'Success probability'],
      status: 'active',
      gradient: 'from-teal-500 to-teal-600'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'coming-soon':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Coming Soon</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Available</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Study Abroad Hub</h1>
              <p className="text-blue-100">Complete application and destination analysis platform</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Smart Applications</span>
              </div>
              <p className="text-sm text-blue-100">Profile-based applications with auto-fill technology</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5" />
                <span className="font-semibold">AI Recommendations</span>
              </div>
              <p className="text-sm text-blue-100">Intelligent university and destination matching</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Success Tracking</span>
              </div>
              <p className="text-sm text-blue-100">Real-time application status and analytics</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Features</p>
                  <p className="text-2xl font-bold">{applicationFeatures.filter(f => f.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Countries</p>
                  <p className="text-2xl font-bold">25+</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Star className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Features Grid */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Application & Analysis Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicationFeatures.map((feature) => (
              <Card key={feature.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`bg-gradient-to-r ${feature.gradient} p-3 rounded-lg text-white mb-3`}>
                      {feature.icon}
                    </div>
                    {getStatusBadge(feature.status)}
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {feature.features.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild className="w-full group-hover:bg-blue-600 transition-colors">
                    <Link href={feature.href}>
                      <span>Access Feature</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/student-applications">
                  <FileText className="w-6 h-6" />
                  <span>New Application</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/smart-application-tracker">
                  <Activity className="w-6 h-6" />
                  <span>Track Applications</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/personalized-destination-analysis">
                  <MapPin className="w-6 h-6" />
                  <span>Find Destinations</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/assessment">
                  <GraduationCap className="w-6 h-6" />
                  <span>University Match</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="text-center">
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Need Help with Applications?</h3>
              <p className="text-gray-600 mb-4">
                Our expert counselors are here to guide you through every step of your study abroad journey.
              </p>
              <Button asChild>
                <Link href="/consultations">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Consultation
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}