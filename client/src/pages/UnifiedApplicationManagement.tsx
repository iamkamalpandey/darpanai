import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Search, Filter, Plus, Eye, Brain, FileText, User, Calendar,
  Globe, GraduationCap, DollarSign, Clock, AlertTriangle,
  TrendingUp, Users, CheckCircle, XCircle, AlertCircle,
  MoreHorizontal, Edit, MessageSquare, Phone, Mail
} from 'lucide-react';

// Enhanced interfaces
interface StudentProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationality: string;
  passportNumber: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
}

interface AcademicDetails {
  highestQualification: string;
  institution: string;
  graduationYear: string;
  gpa: string;
  gradingSystem: string;
  subjects?: Array<{
    name: string;
    grade: string;
    credits: number;
  }>;
}

interface Document {
  id: string;
  type: string;
  name: string;
  uploadedAt: string;
  verified: boolean;
  verificationNotes?: string;
  size: number;
  url?: string;
}

interface AIInsights {
  completionScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedActions: string[];
  missingDocuments: string[];
  estimatedProcessingTime: string;
  strengthsAnalysis: string[];
  weaknessesAnalysis: string[];
  successProbability: number;
  nextSteps: string[];
}

interface Application {
  id: number;
  userId: number;
  applicationNumber: string;
  status: 'draft' | 'submitted' | 'under_review' | 'documents_requested' | 'approved' | 'rejected' | 'on_hold';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  
  // Study Details
  targetCountry: string;
  studyLevel: string;
  fieldOfStudy: string;
  preferredIntake: string;
  specificInstitutions?: string[];
  
  // Student Information
  personalDetails: StudentProfile;
  academicDetails: AcademicDetails;
  
  // Financial
  budgetRange: string;
  fundingSource: string;
  
  // Language Proficiency
  englishProficiency?: {
    testType: string;
    overallScore: number;
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    testDate: string;
  };
  
  // Documents
  documents: Document[];
  
  // Timestamps
  submittedAt?: string;
  lastUpdated: string;
  createdAt: string;
  
  // AI Analysis
  aiInsights?: AIInsights;
  
  // Counselor Notes
  counselorNotes?: Array<{
    id: string;
    message: string;
    createdAt: string;
    createdBy: string;
    type: 'internal' | 'student_visible';
  }>;
}

interface SmartMetrics {
  totalApplications: number;
  submittedToday: number;
  averageProcessingTime: number;
  approvalRate: number;
  priorityBreakdown: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
  statusBreakdown: {
    draft: number;
    submitted: number;
    under_review: number;
    documents_requested: number;
    approved: number;
    rejected: number;
    on_hold: number;
  };
  documentsToReview: number;
  averageCompletionScore: number;
}

export default function UnifiedApplicationManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch applications
  const { data: applicationsResponse, isLoading } = useQuery({
    queryKey: ['/api/admin/applications'],
    staleTime: 30000, // 30 seconds
  });

  const applications: Application[] = useMemo(() => {
    if (!applicationsResponse || !(applicationsResponse as any)?.applications) return [];
    return (applicationsResponse as any).applications.map((app: any) => ({
      ...app,
      personalDetails: app.personalDetails || {},
      academicDetails: app.academicDetails || {},
      documents: app.documents || [],
      counselorNotes: app.counselorNotes || []
    }));
  }, [applicationsResponse]);

  // Enhanced filtering
  const filteredApplications = useMemo(() => {
    return applications.filter((app: Application) => {
      const matchesSearch = searchQuery === '' ||
        (app.applicationNumber && app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        `${app.personalDetails?.firstName || ''} ${app.personalDetails?.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.personalDetails?.email && app.personalDetails.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.targetCountry && app.targetCountry.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.fieldOfStudy && app.fieldOfStudy.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;
      const matchesCountry = countryFilter === 'all' || app.targetCountry === countryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCountry;
    });
  }, [applications, searchQuery, statusFilter, priorityFilter, countryFilter]);

  // Calculate comprehensive metrics
  const smartMetrics: SmartMetrics = useMemo(() => {
    const totalApplications = applications.length;
    const submittedToday = applications.filter(app => {
      if (!app.submittedAt) return false;
      const today = new Date().toDateString();
      return new Date(app.submittedAt).toDateString() === today;
    }).length;

    const priorityBreakdown = {
      urgent: applications.filter(app => app.priority === 'urgent').length,
      high: applications.filter(app => app.priority === 'high').length,
      normal: applications.filter(app => app.priority === 'normal').length,
      low: applications.filter(app => app.priority === 'low').length,
    };

    const statusBreakdown = {
      draft: applications.filter(app => app.status === 'draft').length,
      submitted: applications.filter(app => app.status === 'submitted').length,
      under_review: applications.filter(app => app.status === 'under_review').length,
      documents_requested: applications.filter(app => app.status === 'documents_requested').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      on_hold: applications.filter(app => app.status === 'on_hold').length,
    };

    const documentsToReview = applications.reduce((sum, app) => 
      sum + (app.documents && Array.isArray(app.documents) ? app.documents.filter(doc => !doc.verified).length : 0), 0
    );

    const averageCompletionScore = applications.length > 0 ? 
      applications.reduce((sum, app) => sum + (app.aiInsights?.completionScore || 0), 0) / applications.length : 0;

    const approvalRate = totalApplications > 0 ? 
      (statusBreakdown.approved / totalApplications) * 100 : 0;

    return {
      totalApplications,
      submittedToday,
      averageProcessingTime: 7, // Can be calculated from actual data
      approvalRate,
      priorityBreakdown,
      statusBreakdown,
      documentsToReview,
      averageCompletionScore
    };
  }, [applications]);

  // AI Insights Generation
  const generateInsightsMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      return await apiRequest('POST', `/api/admin/applications/${applicationId}/generate-insights`);
    },
    onSuccess: () => {
      toast({
        title: "AI Analysis Complete",
        description: "Smart insights have been generated for this application.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Status Update
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      return await apiRequest('PATCH', `/api/admin/applications/${applicationId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Application status has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
    },
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      documents_requested: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      on_hold: { color: 'bg-purple-100 text-purple-800', icon: AlertCircle },
    };
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.draft;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      normal: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return priorityStyles[priority as keyof typeof priorityStyles] || priorityStyles.normal;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const uniqueCountries = Array.from(new Set(applications.map(app => app.targetCountry).filter(Boolean)));

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Management Hub</h1>
            <p className="text-gray-600">Comprehensive student application tracking and management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </div>
        </div>

        {/* Smart Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Applications</p>
                  <p className="text-2xl font-bold text-blue-900">{smartMetrics.totalApplications}</p>
                </div>
                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                +{smartMetrics.submittedToday} submitted today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Approval Rate</p>
                  <p className="text-2xl font-bold text-green-900">{smartMetrics.approvalRate.toFixed(1)}%</p>
                </div>
                <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">
                {smartMetrics.statusBreakdown.approved} approved applications
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Pending Review</p>
                  <p className="text-2xl font-bold text-orange-900">{smartMetrics.documentsToReview}</p>
                </div>
                <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-xs text-orange-600 mt-2">
                Documents requiring review
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">AI Completion</p>
                  <p className="text-2xl font-bold text-purple-900">{smartMetrics.averageCompletionScore.toFixed(0)}%</p>
                </div>
                <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-xs text-purple-600 mt-2">
                Average completion score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="documents_requested">Documents Requested</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                {/* Application Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {application.personalDetails?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {application.personalDetails?.firstName || 'Unknown'} {application.personalDetails?.lastName || 'Student'}
                      </h3>
                      <p className="text-sm text-gray-600">{application.applicationNumber || 'No number'}</p>
                      {application.personalDetails?.email && (
                        <p className="text-xs text-gray-500">{application.personalDetails.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getPriorityBadge(application.priority)}>
                      {application.priority}
                    </Badge>
                    <Badge className={getStatusBadge(application.status).color}>
                      {application.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Study Information */}
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{application.targetCountry || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{application.studyLevel || 'Not specified'} in {application.fieldOfStudy || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">{application.preferredIntake || 'Not specified'}</span>
                  </div>
                  {application.budgetRange && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{application.budgetRange}</span>
                    </div>
                  )}
                </div>

                {/* AI Insights Preview */}
                {application.aiInsights && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">AI Analysis</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Completion: </span>
                        <span className="font-medium">{application.aiInsights.completionScore}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success Rate: </span>
                        <span className="font-medium">{application.aiInsights.successProbability}%</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Risk Level: </span>
                        <span className={`font-medium ${
                          application.aiInsights.riskLevel === 'high' ? 'text-red-600' :
                          application.aiInsights.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {application.aiInsights.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>Documents: {application.documents?.length || 0}</span>
                  <span>Updated: {formatDate(application.lastUpdated)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {application.personalDetails?.firstName} {application.personalDetails?.lastName}
                          <Badge className={getStatusBadge(application.status).color}>
                            {application.status.replace('_', ' ')}
                          </Badge>
                        </DialogTitle>
                      </DialogHeader>
                      
                      {selectedApplication && (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                            <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="space-y-4">
                            {/* Personal Information */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Personal Information</CardTitle>
                              </CardHeader>
                              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                                  <p className="text-sm">{selectedApplication.personalDetails?.firstName} {selectedApplication.personalDetails?.lastName}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Email</label>
                                  <p className="text-sm">{selectedApplication.personalDetails?.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Phone</label>
                                  <p className="text-sm">{selectedApplication.personalDetails?.phoneNumber || 'Not provided'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Nationality</label>
                                  <p className="text-sm">{selectedApplication.personalDetails?.nationality}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Passport Number</label>
                                  <p className="text-sm">{selectedApplication.personalDetails?.passportNumber}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                                  <p className="text-sm">{selectedApplication.personalDetails?.dateOfBirth || 'Not provided'}</p>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Academic Information */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Academic Background</CardTitle>
                              </CardHeader>
                              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Highest Qualification</label>
                                  <p className="text-sm">{selectedApplication.academicDetails?.highestQualification || 'Not specified'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Institution</label>
                                  <p className="text-sm">{selectedApplication.academicDetails?.institution || 'Not specified'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">GPA</label>
                                  <p className="text-sm">{selectedApplication.academicDetails?.gpa || 'Not provided'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Graduation Year</label>
                                  <p className="text-sm">{selectedApplication.academicDetails?.graduationYear || 'Not provided'}</p>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Study Preferences */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Study Preferences</CardTitle>
                              </CardHeader>
                              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Target Country</label>
                                  <p className="text-sm">{selectedApplication.targetCountry}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Study Level</label>
                                  <p className="text-sm">{selectedApplication.studyLevel}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Field of Study</label>
                                  <p className="text-sm">{selectedApplication.fieldOfStudy}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Preferred Intake</label>
                                  <p className="text-sm">{selectedApplication.preferredIntake}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Budget Range</label>
                                  <p className="text-sm">{selectedApplication.budgetRange}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Funding Source</label>
                                  <p className="text-sm">{selectedApplication.fundingSource}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          
                          <TabsContent value="documents" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                                  <div className="space-y-3">
                                    {selectedApplication.documents.map((doc) => (
                                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                          <FileText className="h-5 w-5 text-blue-600" />
                                          <div>
                                            <p className="font-medium">{doc.name}</p>
                                            <p className="text-sm text-gray-600">{doc.type} • {(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge className={doc.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                            {doc.verified ? 'Verified' : 'Pending'}
                                          </Badge>
                                          <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-600 text-center py-8">No documents uploaded yet</p>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>
                          
                          <TabsContent value="ai-analysis" className="space-y-4">
                            {selectedApplication.aiInsights ? (
                              <div className="space-y-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <Brain className="h-5 w-5 text-blue-600" />
                                      AI Analysis Results
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{selectedApplication.aiInsights.completionScore}%</p>
                                        <p className="text-sm text-blue-800">Completion Score</p>
                                      </div>
                                      <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{selectedApplication.aiInsights.successProbability}%</p>
                                        <p className="text-sm text-green-800">Success Probability</p>
                                      </div>
                                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-600">{selectedApplication.aiInsights.riskLevel}</p>
                                        <p className="text-sm text-purple-800">Risk Level</p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                                        <ul className="space-y-1">
                                          {selectedApplication.aiInsights.strengthsAnalysis.map((strength, index) => (
                                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                              {strength}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-red-600 mb-2">Areas for Improvement</h4>
                                        <ul className="space-y-1">
                                          {selectedApplication.aiInsights.weaknessesAnalysis.map((weakness, index) => (
                                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                              {weakness}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium text-blue-600 mb-2">Recommended Next Steps</h4>
                                      <ul className="space-y-1">
                                        {selectedApplication.aiInsights.nextSteps.map((step, index) => (
                                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="text-blue-500 font-bold mt-0.5">{index + 1}.</span>
                                            {step}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            ) : (
                              <Card>
                                <CardContent className="text-center py-8">
                                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                  <p className="text-gray-600 mb-4">No AI analysis available for this application</p>
                                  <Button 
                                    onClick={() => generateInsightsMutation.mutate(selectedApplication.id)}
                                    disabled={generateInsightsMutation.isPending}
                                    className="flex items-center gap-2"
                                  >
                                    <Brain className="h-4 w-4" />
                                    Generate AI Analysis
                                  </Button>
                                </CardContent>
                              </Card>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="notes" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Counselor Notes</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {selectedApplication.counselorNotes && selectedApplication.counselorNotes.length > 0 ? (
                                  <div className="space-y-3">
                                    {selectedApplication.counselorNotes.map((note) => (
                                      <div key={note.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <Badge className={note.type === 'internal' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}>
                                            {note.type}
                                          </Badge>
                                          <span className="text-sm text-gray-600">{formatDate(note.createdAt)}</span>
                                        </div>
                                        <p className="text-sm">{note.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">By: {note.createdBy}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8">
                                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 mb-4">No notes available for this application</p>
                                    <Textarea placeholder="Add a new note..." className="mb-2" />
                                    <Button size="sm">Add Note</Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateInsightsMutation.mutate(application.id)}
                    disabled={generateInsightsMutation.isPending}
                    className="flex items-center gap-1"
                  >
                    <Brain className="h-4 w-4" />
                    AI Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || countryFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first application.'}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Application
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}