import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Link } from 'wouter';
import { 
  FileSearch, Shield, FileText, FileCheck, User, GraduationCap, 
  Brain, Sparkles, CheckCircle, Activity, Clock, Target, TrendingUp,
  Upload, Eye, FolderOpen, Archive, ArrowRight, Zap, Star
} from 'lucide-react';

export default function DocumentIntelligenceHub() {
  const analysisTools = [
    {
      id: 'visa-analysis',
      title: 'Visa Document Analysis',
      description: 'AI-powered analysis of visa rejection letters and success documents',
      href: '/visa-analysis',
      icon: <Shield className="w-6 h-6" />,
      features: ['Rejection analysis', 'Success predictions', 'Improvement suggestions'],
      accuracy: '96%',
      status: 'active',
      gradient: 'from-red-500 to-red-600'
    },
    {
      id: 'coe-analysis',
      title: 'COE Certificate Analysis',
      description: 'Comprehensive analysis of Confirmation of Enrollment documents',
      href: '/coe-analysis',
      icon: <FileCheck className="w-6 h-6" />,
      features: ['Document validation', 'Information extraction', 'Compliance checking'],
      accuracy: '98%',
      status: 'active',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'offer-letter-analysis',
      title: 'Offer Letter Analysis',
      description: 'Detailed analysis of university offer letters and admission documents',
      href: '/offer-letter-analysis',
      icon: <FileText className="w-6 h-6" />,
      features: ['Terms extraction', 'Financial analysis', 'Requirements breakdown'],
      accuracy: '94%',
      status: 'active',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'cv-analysis',
      title: 'CV Analysis & Auto-Fill',
      description: 'Smart CV analysis with automatic profile completion',
      href: '/cv-analysis',
      icon: <User className="w-6 h-6" />,
      features: ['Profile auto-fill', 'Skills extraction', 'Experience mapping'],
      accuracy: '92%',
      status: 'active',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'academic-document-analysis',
      title: 'Academic Document Analysis',
      description: 'Comprehensive analysis of transcripts and academic records',
      href: '/academic-document-analysis',
      icon: <GraduationCap className="w-6 h-6" />,
      features: ['Transcript analysis', 'Grade conversion', 'Academic validation'],
      accuracy: '97%',
      status: 'active',
      gradient: 'from-teal-500 to-teal-600'
    }
  ];

  const documentInfo = [
    {
      id: 'offer-letter-info',
      title: 'Offer Letter Details',
      description: 'View extracted information from your offer letters',
      href: '/offer-letter-info',
      icon: <Eye className="w-6 h-6" />,
      count: '12 documents'
    },
    {
      id: 'coe-info',
      title: 'COE Information',
      description: 'Access processed COE certificate information',
      href: '/coe-info',
      icon: <FolderOpen className="w-6 h-6" />,
      count: '8 documents'
    },
    {
      id: 'my-analysis',
      title: 'My Analysis History',
      description: 'Complete history of all your document analyses',
      href: '/my-analysis',
      icon: <Archive className="w-6 h-6" />,
      count: '25 analyses'
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
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FileSearch className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Document Intelligence Hub</h1>
              <p className="text-indigo-100">AI-powered document analysis and information management</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5" />
                <span className="font-semibold">AI Analysis</span>
              </div>
              <p className="text-sm text-indigo-100">Advanced AI processes your documents with 95%+ accuracy</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Instant Processing</span>
              </div>
              <p className="text-sm text-indigo-100">Get results in seconds with real-time analysis</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Smart Insights</span>
              </div>
              <p className="text-sm text-indigo-100">Actionable recommendations for your applications</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileSearch className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                  <p className="text-2xl font-bold">45</p>
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
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">96%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
                  <p className="text-2xl font-bold">8s</p>
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
                  <p className="text-sm font-medium text-gray-600">AI Tools</p>
                  <p className="text-2xl font-bold">{analysisTools.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Tools */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            AI Analysis Tools
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysisTools.map((tool) => (
              <Card key={tool.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-indigo-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`bg-gradient-to-r ${tool.gradient} p-3 rounded-lg text-white mb-3`}>
                      {tool.icon}
                    </div>
                    <div className="text-right">
                      {getStatusBadge(tool.status)}
                      <div className="text-2xl font-bold text-green-600 mt-1">{tool.accuracy}</div>
                      <div className="text-xs text-gray-500">accuracy</div>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">
                    {tool.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">{tool.description}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {tool.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild className="w-full group-hover:bg-indigo-600 transition-colors">
                    <Link href={tool.href}>
                      <Upload className="w-4 h-4 mr-2" />
                      <span>Analyze Documents</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Document Information */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            Document Information & History
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {documentInfo.map((info) => (
              <Card key={info.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
                <CardHeader className="text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white mx-auto w-fit mb-4">
                    {info.icon}
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {info.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">{info.description}</p>
                  <Badge variant="outline" className="w-fit mx-auto mt-2">
                    {info.count}
                  </Badge>
                </CardHeader>
                
                <CardContent>
                  <Button asChild className="w-full group-hover:bg-blue-600 transition-colors">
                    <Link href={info.href}>
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Upload Section */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
          <CardContent className="p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quick Document Upload</h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your documents here or select files to start AI analysis
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button asChild variant="outline">
                <Link href="/visa-analysis">
                  <Shield className="w-4 h-4 mr-2" />
                  Visa Documents
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/offer-letter-analysis">
                  <FileText className="w-4 h-4 mr-2" />
                  Offer Letters
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/coe-analysis">
                  <FileCheck className="w-4 h-4 mr-2" />
                  COE Certificates
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Features Highlight */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="p-6">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Powered by Advanced AI</h3>
              <p className="text-gray-600 mb-4">
                Our document intelligence platform uses cutting-edge AI models including DeepSeek and OpenAI 
                to provide the most accurate analysis and insights for your academic documents.
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>95%+ Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Real-time Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>Secure & Private</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}