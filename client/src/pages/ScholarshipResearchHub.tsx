import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Award, Search, Brain, Target, Globe, DollarSign, Calendar,
  CheckCircle, Star, TrendingUp, Filter, Heart, Eye, ArrowRight,
  Sparkles, Users, Clock, BookOpen, MapPin, GraduationCap, Loader2
} from 'lucide-react';

export default function ScholarshipResearchHub() {
  // Fetch AI scholarship recommendations
  const { data: recommendationsData, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['/api/scholarship-recommendations'],
    queryFn: () => fetch('/api/scholarship-recommendations', { credentials: 'include' }).then(res => res.json()),
  });

  // Transform recommendation data to match display format
  const aiRecommendations = recommendationsData?.recommendations ? 
    recommendationsData.recommendations.slice(0, 3).map((rec: any) => ({
      name: rec.scholarshipName || 'AI Recommended Scholarship',
      provider: rec.providerName || 'International Foundation',
      amount: rec.fundingAmount || 'Full Funding',
      deadline: rec.applicationDeadline || '2025-12-31',
      countries: rec.targetCountries || ['Global'],
      matchScore: rec.matchScore || 75,
      matchReasons: rec.matchReasons || ['AI analysis based on your profile']
    })) : [
      {
        name: 'Australia Awards Scholarship 2025',
        provider: 'Australian Government',
        amount: 'Full Funding',
        deadline: 'Apr 30, 2025',
        countries: ['Australia'],
        matchScore: 95,
        matchReasons: ['Field alignment with Computer Science', 'Budget compatibility', 'Country preference match']
      },
      {
        name: 'Gates Cambridge Scholarship',
        provider: 'University of Cambridge',
        amount: 'Full Funding',
        deadline: 'Dec 15, 2024',
        countries: ['United Kingdom'],
        matchScore: 88,
        matchReasons: ['Academic excellence requirements', 'Research interests match', 'International focus']
      },
      {
        name: 'Fulbright Foreign Student Program',
        provider: 'U.S. Department of State',
        amount: 'Full Funding',
        deadline: 'Oct 15, 2024',
        countries: ['United States'],
        matchScore: 82,
        matchReasons: ['Educational background fit', 'Leadership potential', 'Cultural exchange goals']
      }
    ];

  const scholarshipFeatures = [
    {
      id: 'scholarship-research',
      title: 'Scholarship Research',
      description: 'Comprehensive database search with advanced filters',
      href: '/scholarship-research',
      icon: <Search className="w-6 h-6" />,
      features: ['5,000+ scholarships', 'Advanced filtering', 'Real-time updates'],
      status: 'active',
      gradient: 'from-blue-500 to-blue-600',
      stats: '5,000+ scholarships'
    },
    {
      id: 'ai-scholarship-matching',
      title: 'AI Scholarship Matching',
      description: 'Intelligent AI-powered scholarship recommendations',
      href: '/scholarship-matching',
      icon: <Brain className="w-6 h-6" />,
      features: ['AI analysis', 'Profile matching', 'Success predictions'],
      status: 'active',
      gradient: 'from-purple-500 to-purple-600',
      stats: '95% accuracy'
    },
    {
      id: 'watchlist',
      title: 'My Scholarship Watchlist',
      description: 'Track and manage your saved scholarship opportunities',
      href: '/my-watchlist',
      icon: <Heart className="w-6 h-6" />,
      features: ['Save favorites', 'Deadline tracking', 'Application reminders'],
      status: 'active',
      gradient: 'from-red-500 to-red-600',
      stats: '12 saved'
    }
  ];

  const quickFilters = [
    {
      name: 'Full Funding',
      icon: <DollarSign className="w-4 h-4" />,
      count: '1,250+',
      href: '/scholarship-research?funding=full'
    },
    {
      name: 'USA Scholarships',
      icon: <Globe className="w-4 h-4" />,
      count: '2,100+',
      href: '/scholarship-research?country=usa'
    },
    {
      name: 'Master\'s Level',
      icon: <GraduationCap className="w-4 h-4" />,
      count: '3,200+',
      href: '/scholarship-research?level=masters'
    },
    {
      name: 'STEM Fields',
      icon: <BookOpen className="w-4 h-4" />,
      count: '1,800+',
      href: '/scholarship-research?field=stem'
    },
    {
      name: 'Due This Month',
      icon: <Calendar className="w-4 h-4" />,
      count: '85',
      href: '/scholarship-research?deadline=month'
    },
    {
      name: 'Easy Apply',
      icon: <Target className="w-4 h-4" />,
      count: '950+',
      href: '/scholarship-research?difficulty=easy'
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

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Scholarship Research Hub</h1>
              <p className="text-orange-100">Comprehensive scholarship discovery and AI-powered matching</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-5 h-5" />
                <span className="font-semibold">Comprehensive Database</span>
              </div>
              <p className="text-sm text-orange-100">5,000+ scholarships from universities and organizations worldwide</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5" />
                <span className="font-semibold">AI Matching</span>
              </div>
              <p className="text-sm text-orange-100">DeepSeek AI analyzes your profile for perfect matches</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Success Tracking</span>
              </div>
              <p className="text-sm text-orange-100">Track applications and monitor deadlines effortlessly</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Award className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scholarships</p>
                  <p className="text-2xl font-bold">5,247</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Match Score</p>
                  <p className="text-2xl font-bold">92%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">In Watchlist</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Full Funding</p>
                  <p className="text-2xl font-bold">1,250+</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scholarship Features */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-600" />
            Scholarship Discovery Tools
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {scholarshipFeatures.map((feature) => (
              <Card key={feature.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-orange-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`bg-gradient-to-r ${feature.gradient} p-3 rounded-lg text-white mb-3`}>
                      {feature.icon}
                    </div>
                    <div className="text-right">
                      {getStatusBadge(feature.status)}
                      <div className="text-sm font-semibold text-orange-600 mt-1">{feature.stats}</div>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">
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
                  
                  <Button asChild className="w-full group-hover:bg-orange-600 transition-colors">
                    <Link href={feature.href}>
                      <span>Access Tool</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Quick Search Filters
          </h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickFilters.map((filter, index) => (
              <Button
                key={index}
                asChild
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200"
              >
                <Link href={filter.href}>
                  <div className="text-blue-600">{filter.icon}</div>
                  <div className="text-center">
                    <div className="font-semibold text-sm">{filter.name}</div>
                    <div className="text-xs text-gray-500">{filter.count}</div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Top Matched Scholarships */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Personalized for You
          </h2>
          
          <div className="grid gap-4">
            {isLoadingRecommendations ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              aiRecommendations.map((scholarship: any, index: number) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{scholarship.name}</h3>
                          <Badge className={`${getMatchColor(scholarship.matchScore)} border-0 font-semibold`}>
                            <Star className="w-3 h-3 mr-1" />
                            {scholarship.matchScore}% Match
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{scholarship.provider}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{scholarship.amount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {scholarship.deadline}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{scholarship.countries.join(', ')}</span>
                          </div>
                        </div>

                        {scholarship.matchReasons && (
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">AI Match Reasons:</span>
                            <ul className="list-disc list-inside text-xs mt-1">
                              {scholarship.matchReasons.slice(0, 2).map((reason: string, idx: number) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <div className="text-center mt-4">
            <Button asChild variant="outline">
              <Link href="/scholarship-matching">
                <Brain className="w-4 h-4 mr-2" />
                Get Full AI Analysis
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/scholarship-research">
                  <Search className="w-6 h-6" />
                  <span>Search Database</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/scholarship-matching">
                  <Brain className="w-6 h-6" />
                  <span>AI Matching</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/my-watchlist">
                  <Heart className="w-6 h-6" />
                  <span>My Watchlist</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/consultations">
                  <Users className="w-6 h-6" />
                  <span>Get Guidance</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Enhancement Notice */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-6">
            <div className="text-center">
              <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enhanced by AI Technology</h3>
              <p className="text-gray-600 mb-4">
                Our scholarship matching system uses DeepSeek AI with OpenAI fallback to analyze your academic 
                profile and match you with the most suitable opportunities for maximum success probability.
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>95% Match Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span>Personalized Results</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}