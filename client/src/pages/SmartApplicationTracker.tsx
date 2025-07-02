import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Calendar, 
  Award, 
  MapPin, 
  Target, 
  Bell,
  ArrowRight,
  ExternalLink,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  MessageSquare,
  Star,
  Users,
  BarChart3,
  Activity
} from 'lucide-react';

interface Application {
  id: number;
  applicationNumber: string;
  studyLevel: string;
  fieldOfStudy: string;
  targetCountry: string;
  preferredIntake: string;
  budgetRange: string;
  fundingSource: string;
  status: 'draft' | 'submitted' | 'under_review' | 'documents_requested' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  submittedAt?: string;
  lastUpdated: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    nationality: string;
  };
  progress: number;
  nextSteps: string[];
  recommendations: {
    type: 'university' | 'scholarship' | 'document' | 'preparation';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionUrl?: string;
  }[];
  timeline: {
    date: string;
    event: string;
    status: 'completed' | 'pending' | 'upcoming';
    description?: string;
  }[];
}

interface ApplicationStats {
  total: number;
  inProgress: number;
  submitted: number;
  approved: number;
  averageProgress: number;
  completionRate: number;
}

export default function SmartApplicationTracker() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'list' | 'timeline' | 'analytics'>('list');

  // Fetch user applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['/api/student-applications'],
  }) as { data: Application[]; isLoading: boolean };

  // Calculate application statistics
  const stats: ApplicationStats = {
    total: applications.length,
    inProgress: applications.filter(app => ['draft', 'submitted', 'under_review', 'documents_requested'].includes(app.status)).length,
    submitted: applications.filter(app => app.status === 'submitted').length,
    approved: applications.filter(app => app.status === 'approved').length,
    averageProgress: applications.length > 0 ? 
      Math.round(applications.reduce((sum, app) => sum + (app.progress || 0), 0) / applications.length) : 0,
    completionRate: applications.length > 0 ? 
      Math.round((applications.filter(app => app.status === 'approved').length / applications.length) * 100) : 0
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      documents_requested: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-50 border-green-200 text-green-800',
      medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      high: 'bg-red-50 border-red-200 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const filteredApplications = selectedStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === selectedStatus);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Activity className="h-8 w-8 text-blue-600 mr-3" />
                Smart Application Tracker
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Track your study abroad applications with AI-powered insights and personalized recommendations
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/profile-based-application">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Brain className="h-4 w-4 mr-2" />
                  Create New Application
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Applications</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">In Progress</p>
                  <p className="text-3xl font-bold">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Approved</p>
                  <p className="text-3xl font-bold">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Avg Progress</p>
                  <p className="text-3xl font-bold">{stats.averageProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Success Rate</p>
                  <p className="text-3xl font-bold">{stats.completionRate}%</p>
                </div>
                <Award className="h-8 w-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="list">Applications</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Status Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="documents_requested">Documents Requested</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Applications List View */}
          <TabsContent value="list" className="space-y-6">
            {filteredApplications.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h3>
                  <p className="text-gray-600 mb-6">
                    {selectedStatus === 'all' 
                      ? "Get started by creating your first study abroad application using your profile information."
                      : `No applications found with status: ${selectedStatus}`
                    }
                  </p>
                  <Link href="/profile-based-application">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Brain className="h-4 w-4 mr-2" />
                      Create Your First Application
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{application.applicationNumber}</CardTitle>
                            <p className="text-sm text-gray-600">
                              {application.studyLevel} in {application.fieldOfStudy} • {application.targetCountry}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(application.priority)}>
                            {application.priority.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Application Progress</span>
                          <span className="text-sm text-gray-600">{application.progress || 0}%</span>
                        </div>
                        <Progress 
                          value={application.progress || 0} 
                          className="h-2"
                        />
                      </div>

                      {/* Application Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Preferred Intake</p>
                            <p className="text-sm font-medium">{application.preferredIntake}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Budget Range</p>
                            <p className="text-sm font-medium">{application.budgetRange}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Funding Source</p>
                            <p className="text-sm font-medium">{application.fundingSource}</p>
                          </div>
                        </div>
                      </div>

                      {/* Next Steps */}
                      {application.nextSteps && application.nextSteps.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Next Steps
                          </h4>
                          <ul className="space-y-1">
                            {application.nextSteps.slice(0, 2).map((step, index) => (
                              <li key={index} className="text-sm text-blue-800 flex items-start">
                                <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                                  {index + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Contact Expert
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(application.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Timeline View */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Application Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="border-l-2 border-blue-200 pl-6 pb-6 relative">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{application.applicationNumber}</h3>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {application.studyLevel} in {application.fieldOfStudy} • {application.targetCountry}
                        </p>
                        <div className="flex items-center justify-between">
                          <Progress value={application.progress || 0} className="flex-1 mr-4 h-2" />
                          <span className="text-sm text-gray-500">
                            {new Date(application.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics View */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Progress Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['0-25%', '26-50%', '51-75%', '76-100%'].map((range, index) => {
                      const count = applications.filter(app => {
                        const progress = app.progress || 0;
                        if (index === 0) return progress <= 25;
                        if (index === 1) return progress > 25 && progress <= 50;
                        if (index === 2) return progress > 50 && progress <= 75;
                        return progress > 75;
                      }).length;
                      
                      return (
                        <div key={range} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{range}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  index === 0 ? 'bg-red-500' : 
                                  index === 1 ? 'bg-yellow-500' : 
                                  index === 2 ? 'bg-blue-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${applications.length > 0 ? (count / applications.length) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Status Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['draft', 'submitted', 'under_review', 'documents_requested', 'approved', 'rejected'].map((status) => {
                      const count = applications.filter(app => app.status === status).length;
                      const percentage = applications.length > 0 ? (count / applications.length) * 100 : 0;
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <Badge className={getStatusColor(status)} variant="outline">
                            {status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights and Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-600" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Key Insights</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Strong Progress</p>
                          <p className="text-xs text-gray-600">Your average progress is {stats.averageProgress}%, which is above the platform average.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Focus Areas</p>
                          <p className="text-xs text-gray-600">Complete pending document submissions to accelerate your application progress.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Recommendations</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Award className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Scholarship Opportunities</p>
                          <p className="text-xs text-gray-600">3 new scholarships match your profile. Review them now.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Users className="h-4 w-4 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Expert Consultation</p>
                          <p className="text-xs text-gray-600">Schedule a session to optimize your application strategy.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}