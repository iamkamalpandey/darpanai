import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Brain,
  Sparkles,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  MessageSquare,
  FileCheck,
  Star,
  Target,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: number;
  userId: number;
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
    phoneNumber?: string;
    dateOfBirth?: string;
    nationality: string;
    passportNumber: string;
  };
  documents: Array<{
    type: string;
    name: string;
    uploadedAt: string;
    verified: boolean;
  }>;
  notes: Array<{
    id: number;
    message: string;
    createdAt: string;
    createdBy: string;
    type: 'internal' | 'student_visible';
  }>;
  aiInsights?: {
    completionScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendedActions: string[];
    missingDocuments: string[];
    estimatedProcessingTime: string;
  };
}

interface SmartMetrics {
  totalApplications: number;
  submittedToday: number;
  averageProcessingTime: number;
  approvalRate: number;
  highPriorityCount: number;
  documentsToReview: number;
}

export default function SmartApplicationManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch applications with enhanced data
  const { data: applicationsResponse, isLoading } = useQuery({
    queryKey: ['/api/admin/applications', { search: searchQuery, status: statusFilter, priority: priorityFilter }],
  });

  // Generate AI insights for applications
  const generateInsightsMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      return await apiRequest('POST', `/api/admin/applications/${applicationId}/generate-insights`, {});
    },
    onSuccess: () => {
      toast({
        title: "AI Insights Generated",
        description: "Smart analysis completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
    },
  });

  const applications: Application[] = (applicationsResponse as any)?.applications || [];
  
  // Enhanced filtering with smart search
  const filteredApplications = applications.filter((app: Application) => {
    const matchesSearch = 
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${app.personalDetails?.firstName} ${app.personalDetails?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.targetCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.fieldOfStudy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate smart metrics
  const smartMetrics: SmartMetrics = {
    totalApplications: applications.length,
    submittedToday: applications.filter(app => {
      if (!app.submittedAt) return false;
      const today = new Date().toDateString();
      return new Date(app.submittedAt).toDateString() === today;
    }).length,
    averageProcessingTime: 7, // Days - could be calculated from actual data
    approvalRate: applications.length > 0 ? 
      (applications.filter(app => app.status === 'approved').length / applications.length) * 100 : 0,
    highPriorityCount: applications.filter(app => app.priority === 'high').length,
    documentsToReview: applications.reduce((sum, app) => 
      sum + app.documents.filter(doc => !doc.verified).length, 0
    ),
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, color: string }> = {
      draft: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      submitted: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      under_review: { variant: 'default' as const, color: 'bg-yellow-100 text-yellow-800' },
      documents_requested: { variant: 'destructive' as const, color: 'bg-orange-100 text-orange-800' },
      approved: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      rejected: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    };
    return variants[status] || variants.draft;
  };

  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return variants[priority] || variants.low;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with AI Enhancement */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            Smart Application Management
          </h1>
          <p className="text-gray-600 mt-1">AI-powered application tracking and insights</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate AI Report
        </Button>
      </div>

      {/* Smart Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-900">{smartMetrics.totalApplications}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Submitted Today</p>
                <p className="text-2xl font-bold text-green-900">{smartMetrics.submittedToday}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Processing</p>
                <p className="text-2xl font-bold text-purple-900">{smartMetrics.averageProcessingTime}d</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Approval Rate</p>
                <p className="text-2xl font-bold text-emerald-900">{smartMetrics.approvalRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">High Priority</p>
                <p className="text-2xl font-bold text-red-900">{smartMetrics.highPriorityCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Docs to Review</p>
                <p className="text-2xl font-bold text-orange-900">{smartMetrics.documentsToReview}</p>
              </div>
              <FileCheck className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by application number, student name, country, or field..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="documents_requested">Docs Requested</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table with AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Applications ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {application.personalDetails?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {application.personalDetails?.firstName} {application.personalDetails?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{application.applicationNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityBadge(application.priority)}>
                        {application.priority}
                      </Badge>
                      <Badge className={getStatusBadge(application.status).color}>
                        {application.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Study Level</p>
                      <p className="font-medium">{application.studyLevel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Target Country</p>
                      <p className="font-medium">{application.targetCountry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Field of Study</p>
                      <p className="font-medium">{application.fieldOfStudy}</p>
                    </div>
                  </div>

                  {/* AI Insights Preview */}
                  {application.aiInsights && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">AI Insights</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Completion: </span>
                          <span className="font-medium">{application.aiInsights.completionScore}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Risk Level: </span>
                          <span className={`font-medium ${
                            application.aiInsights.riskLevel === 'high' ? 'text-red-600' :
                            application.aiInsights.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {application.aiInsights.riskLevel}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Est. Processing: </span>
                          <span className="font-medium">{application.aiInsights.estimatedProcessingTime}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Last updated: {new Date(application.lastUpdated).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateInsightsMutation.mutate(application.id)}
                        disabled={generateInsightsMutation.isPending}
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        AI Analysis
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No applications found matching your criteria</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}