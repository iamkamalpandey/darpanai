import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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
  Rocket,
  Play,
  Download,
  MessageCircle,
  Calendar,
  Activity,
  Network,
  Layers
} from 'lucide-react';

export default function ModernPublicLanding() {
  const aiCapabilities = [
    {
      icon: Brain,
      title: "Advanced Neural Networks",
      description: "Proprietary AI models trained on 27,000+ education documents with 96.8% accuracy",
      metrics: "96.8% Accuracy",
      gradient: "from-purple-600 to-blue-700"
    },
    {
      icon: Cpu,
      title: "Real-time Document Processing",
      description: "Lightning-fast AI analysis with sub-3-second processing for complex documents",
      metrics: "2.3s Processing",
      gradient: "from-blue-600 to-indigo-700"
    },
    {
      icon: Database,
      title: "Predictive Intelligence",
      description: "Machine learning algorithms predict success rates with 94.5% accuracy",
      metrics: "94.5% Prediction",
      gradient: "from-emerald-600 to-teal-700"
    },
    {
      icon: Network,
      title: "Global Knowledge Graph",
      description: "Connected intelligence across 50+ countries and 500+ institutions",
      metrics: "50+ Countries",
      gradient: "from-orange-600 to-red-700"
    }
  ];

  const marketMetrics = [
    {
      label: "Global Market Size",
      value: "$67.8B",
      sublabel: "International Education",
      trend: "+12.5% CAGR",
      icon: Globe
    },
    {
      label: "Documents Processed",
      value: "27,123+",
      sublabel: "AI Analyses Completed",
      trend: "+245% Growth",
      icon: FileText
    },
    {
      label: "Success Rate",
      value: "96.8%",
      sublabel: "Analysis Accuracy",
      trend: "+3.2% Improvement",
      icon: Target
    },
    {
      label: "User Satisfaction",
      value: "98.2%",
      sublabel: "Platform Rating",
      trend: "+1.8% Monthly",
      icon: Star
    }
  ];

  const competitiveAdvantages = [
    {
      title: "Proprietary AI Models",
      description: "Custom-trained neural networks specifically for education document analysis",
      icon: Brain,
      color: "purple"
    },
    {
      title: "Real-time Processing",
      description: "Sub-3-second analysis vs industry average of 15-30 seconds",
      icon: Zap,
      color: "blue"
    },
    {
      title: "Global Database",
      description: "Comprehensive scholarship and institution data across 50+ countries",
      icon: Database,
      color: "emerald"
    },
    {
      title: "Predictive Analytics",
      description: "Success probability forecasting with 94.5% accuracy",
      icon: TrendingUp,
      color: "orange"
    }
  ];

  const investmentHighlights = [
    {
      title: "Massive TAM",
      value: "$67.8B",
      description: "International education market growing at 12.5% CAGR",
      icon: Globe
    },
    {
      title: "Proven Traction",
      value: "27K+",
      description: "Documents processed with 96.8% accuracy rate",
      icon: Activity
    },
    {
      title: "Scalable Technology",
      value: "AI-First",
      description: "Proprietary models with defensible technology moat",
      icon: Cpu
    },
    {
      title: "Global Reach",
      value: "50+ Countries",
      description: "Multi-market expansion with localized AI capabilities",
      icon: Network
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
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-blue-700/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Education Intelligence Platform
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              The Future of
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 bg-clip-text text-transparent"> AI Education</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Revolutionary AI platform processing 27,000+ education documents with 96.8% accuracy. 
              Transforming how students navigate global education opportunities through intelligent automation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 text-lg">
                <Rocket className="w-5 h-5 mr-2" />
                Experience AI Demo
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2">
                <Play className="w-5 h-5 mr-2" />
                Watch Technology Overview
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {marketMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card key={index} className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <IconComponent className="h-8 w-8 mx-auto mb-3 text-indigo-600" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className="text-sm font-medium text-gray-700 mb-1">{metric.label}</div>
                    <div className="text-xs text-gray-500">{metric.sublabel}</div>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {metric.trend}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Proprietary AI Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced neural networks and machine learning algorithms deliver unprecedented accuracy 
              in education document analysis and predictive intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {aiCapabilities.map((capability, index) => {
              const IconComponent = capability.icon;
              return (
                <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${capability.gradient}`}></div>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${capability.gradient} text-white flex-shrink-0`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{capability.title}</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">{capability.description}</p>
                        <Badge className={`bg-gradient-to-r ${capability.gradient} text-white px-4 py-1`}>
                          {capability.metrics}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Defensible Competitive Moats
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our technology advantages create significant barriers to entry and sustainable competitive positioning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {competitiveAdvantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              const colorClasses: Record<string, string> = {
                purple: "from-purple-500 to-indigo-600",
                blue: "from-blue-500 to-cyan-600",
                emerald: "from-emerald-500 to-teal-600",
                orange: "from-orange-500 to-red-600"
              };

              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${colorClasses[advantage.color] || colorClasses.purple} text-white mb-4`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{advantage.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{advantage.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Investment Opportunity
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Positioned at the intersection of AI and education - two of the fastest-growing technology sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {investmentHighlights.map((highlight, index) => {
              const IconComponent = highlight.icon;
              return (
                <Card key={index} className="border-0 shadow-lg text-center">
                  <CardContent className="p-8">
                    <div className="p-4 bg-indigo-100 rounded-2xl inline-flex mb-4">
                      <IconComponent className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{highlight.title}</h3>
                    <div className="text-3xl font-bold text-indigo-600 mb-3">{highlight.value}</div>
                    <p className="text-gray-600">{highlight.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 rounded-3xl p-12 text-center text-white">
            <h3 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Transform Education with AI?
            </h3>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join us in revolutionizing how students navigate global education opportunities through intelligent automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Investor Demo
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4">
                <Download className="w-5 h-5 mr-2" />
                Download Pitch Deck
              </Button>
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
                AI-powered education intelligence platform transforming how students navigate global opportunities.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-gray-400">
                <p>AI Document Analysis</p>
                <p>Scholarship Matching</p>
                <p>Predictive Analytics</p>
                <p>Global Database</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-gray-400">
                <p>About Us</p>
                <p>Investors</p>
                <p>Careers</p>
                <p>Contact</p>
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