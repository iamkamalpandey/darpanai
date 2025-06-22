import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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
  DollarSign,
  ArrowRight,
  Star,
  Play
} from 'lucide-react';

export default function EducationLanding() {
  const aiServices = [
    {
      icon: FileText,
      title: "Visa Document Analysis",
      description: "Instant AI analysis of your visa application documents with success probability predictions and improvement recommendations",
      accuracy: "96.8%",
      processingTime: "2-3 seconds",
      color: "from-blue-500 to-indigo-600",
      features: ["Document accuracy verification", "Success probability analysis", "Improvement suggestions", "Compliance checking"]
    },
    {
      icon: GraduationCap,
      title: "COE Certificate Intelligence",
      description: "Comprehensive analysis of Confirmation of Enrollment certificates with financial breakdown and compliance verification",
      accuracy: "94.5%",
      processingTime: "3-5 seconds",
      color: "from-emerald-500 to-teal-600",
      features: ["Compliance verification", "Financial analysis", "Course validation", "Next steps guidance"]
    },
    {
      icon: BookOpen,
      title: "Offer Letter Review",
      description: "Detailed analysis of university offer letters with hidden cost identification and scholarship opportunity matching",
      accuracy: "95.2%",
      processingTime: "4-6 seconds",
      color: "from-purple-500 to-pink-600",
      features: ["Terms analysis", "Hidden cost detection", "Scholarship matching", "Requirements breakdown"]
    },
    {
      icon: Award,
      title: "Scholarship Research",
      description: "AI-powered matching with global scholarships based on your academic profile and study preferences",
      accuracy: "92.8%",
      processingTime: "5-8 seconds",
      color: "from-orange-500 to-red-600",
      features: ["Profile matching", "Eligibility assessment", "Application deadlines", "Success probability"]
    }
  ];

  const platformStats = [
    {
      value: "27,000+",
      label: "Documents Analyzed",
      description: "Successfully processed with AI",
      icon: FileText
    },
    {
      value: "96.8%",
      label: "Analysis Accuracy",
      description: "Precision in document analysis",
      icon: Target
    },
    {
      value: "50+",
      label: "Countries Covered",
      description: "Global education support",
      icon: Globe
    },
    {
      value: "2-5 sec",
      label: "Processing Time",
      description: "Average response time",
      icon: Zap
    }
  ];

  const benefits = [
    {
      title: "Instant Analysis",
      description: "Get comprehensive document analysis in seconds, not days",
      icon: Zap,
      color: "blue"
    },
    {
      title: "AI-Powered Accuracy",
      description: "Advanced machine learning ensures 96.8% analysis precision",
      icon: Brain,
      color: "purple"
    },
    {
      title: "Global Coverage",
      description: "Support for education systems across 50+ countries worldwide",
      icon: Globe,
      color: "emerald"
    },
    {
      title: "Expert Guidance",
      description: "Professional recommendations based on your specific situation",
      icon: Users,
      color: "orange"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Darpan Intelligence</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Education Intelligence
            </Badge>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Make Informed
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 bg-clip-text text-transparent"> Education Decisions</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Advanced AI analysis for your visa documents, offer letters, and education certificates. 
              Get instant insights with 96.8% accuracy to navigate your global education journey successfully.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 text-lg">
                  <Brain className="w-5 h-5 mr-2" />
                  Start Free Analysis
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2">
                <Play className="w-5 h-5 mr-2" />
                See How It Works
              </Button>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {platformStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="border-0 shadow-lg bg-white/60 backdrop-blur-sm text-center">
                  <CardContent className="p-6">
                    <IconComponent className="h-8 w-8 mx-auto mb-3 text-indigo-600" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-700 mb-1">{stat.label}</div>
                    <div className="text-xs text-gray-500">{stat.description}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Education Analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced artificial intelligence analyzes your education documents with precision, 
              providing instant insights to help you make informed decisions about your academic future.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {aiServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${service.color} text-white flex-shrink-0`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{service.accuracy}</div>
                            <div className="text-sm text-gray-600">Accuracy</div>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {service.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            Processing: {service.processingTime}
                          </div>
                          <Badge className={`bg-gradient-to-r ${service.color} text-white px-4 py-1`}>
                            Available Now
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose AI-Powered Analysis?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of education document analysis with our advanced AI technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              const colorClasses: Record<string, string> = {
                blue: "from-blue-500 to-cyan-600",
                purple: "from-purple-500 to-indigo-600",
                emerald: "from-emerald-500 to-teal-600",
                orange: "from-orange-500 to-red-600"
              };

              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${colorClasses[benefit.color] || colorClasses.blue} text-white mb-4`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 rounded-3xl p-12 text-center text-white">
            <h3 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Analyze Your Education Documents?
            </h3>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join thousands of students who trust our AI-powered platform for accurate document analysis and education guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4">
                  <Brain className="w-5 h-5 mr-2" />
                  Start Free Analysis
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4">
                  <Users className="w-5 h-5 mr-2" />
                  Sign In to Continue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Darpan Intelligence</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                AI-powered education intelligence platform helping students make informed decisions about their global education journey.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <div className="space-y-2 text-gray-400">
                <p>Visa Document Analysis</p>
                <p>COE Certificate Review</p>
                <p>Offer Letter Intelligence</p>
                <p>Scholarship Research</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <p>Help Center</p>
                <p>Contact Support</p>
                <p>Document Templates</p>
                <p>Resource Center</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Darpan Intelligence. All rights reserved. A product of Epitome Solutions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}