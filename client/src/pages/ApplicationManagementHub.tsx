import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Search, Filter, Plus, Eye, Brain, FileText, User, Calendar,
  Globe, GraduationCap, Clock, AlertTriangle, TrendingUp, Users,
  CheckCircle, XCircle, AlertCircle, Edit3, MessageSquare,
  RefreshCw, Phone, Mail, MapPin, Flag, Star, ChevronDown,
  MoreHorizontal, Edit, Settings, Target, Award, BookOpen,
  BarChart3, PieChart, Activity, Layers, FilterIcon, Download
} from 'lucide-react';

// Interfaces
interface Application {
  id: number;
  applicationNumber: string;
  userId: number;
  status: 'draft' | 'submitted' | 'under_review' | 'documents_requested' | 'approved' | 'rejected' | 'on_hold';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  targetCountry: string;
  studyLevel: string;
  fieldOfStudy: string;
  preferredIntake: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    nationality: string;
    passportNumber: string;
  };
  academicDetails: {
    highestQualification: string;
    institutionName: string;
    graduationDate: string;
    gpa: string;
    transcriptAvailable: boolean;
  };
  budgetRange: string;
  fundingSource: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
    verified: boolean;
  }>;
  submittedAt?: string;
  lastUpdated: string;
  createdAt: string;
  remarks?: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
    createdBy: string;
  }>;
}

export default function ApplicationManagementHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  
  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [remarkText, setRemarkText] = useState('');
  const [remarkType, setRemarkType] = useState<'general' | 'urgent' | 'follow_up' | 'document_request'>('general');
  const [isInternal, setIsInternal] = useState(false);

  // Fetch applications data
  const { data: applicationsData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/applications'],
    retry: 3,
  });

  const applications = (applicationsData as any)?.applications || [];

  // Calculate comprehensive metrics according to requirements
  const metrics = useMemo(() => {
    const total = applications.length;
    const todaySubmissions = applications.filter((app: Application) => {
      const today = new Date().toDateString();
      return new Date(app.submittedAt || app.createdAt).toDateString() === today;
    }).length;

    const approved = applications.filter((app: Application) => app.status === 'approved').length;
    const pending = applications.filter((app: Application) => 
      ['under_review', 'documents_requested'].includes(app.status)
    ).length;

    // Mock AI completion score calculation (would be real in production)
    const avgAiCompletion = applications.length > 0 ? 
      Math.round(applications.reduce((acc: number, app: any) => {
        // Mock completion score based on available data
        let score = 0;
        if (app.personalDetails?.firstName) score += 20;
        if (app.personalDetails?.email) score += 20;
        if (app.academicDetails?.highestQualification) score += 20;
        if (app.documents?.length > 0) score += 20;
        if (app.status !== 'draft') score += 20;
        return acc + score;
      }, 0) / applications.length) : 0;

    return {
      totalApplications: total,
      submittedToday: todaySubmissions,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      pendingReview: pending,
      aiCompletion: avgAiCompletion,
      approvedApplications: approved
    };
  }, [applications]);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status, remarks }: any) => {
      return apiRequest('PATCH', `/api/admin/applications/${applicationId}/status`, {
        status, remarks
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
      toast({ title: "Status Updated", description: "Application status updated successfully." });
      setStatusDialogOpen(false);
      resetDialogStates();
    },
    onError: (error: any) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    },
  });

  const addRemarkMutation = useMutation({
    mutationFn: async ({ applicationId, type, message, isInternal }: any) => {
      return apiRequest('POST', `/api/admin/applications/${applicationId}/remarks`, {
        type, message, isInternal
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
      toast({ title: "Remark Added", description: "Remark added successfully." });
      setRemarkDialogOpen(false);
      resetDialogStates();
    },
    onError: (error: any) => {
      toast({ title: "Failed to Add Remark", description: error.message, variant: "destructive" });
    },
  });

  // Helper functions
  const resetDialogStates = () => {
    setSelectedApplication(null);
    setNewStatus('');
    setStatusNotes('');
    setRemarkText('');
    setRemarkType('general');
    setIsInternal(false);
  };

  const openStatusDialog = (application: Application) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setStatusDialogOpen(true);
  };

  const openRemarkDialog = (application: Application) => {
    setSelectedApplication(application);
    setRemarkDialogOpen(true);
  };

  const openViewDialog = (application: Application) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const openEditDialog = (application: Application) => {
    setSelectedApplication(application);
    setEditDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedApplication) return;
    updateStatusMutation.mutate({
      applicationId: selectedApplication.id,
      status: newStatus,
      remarks: statusNotes
    });
  };

  const handleAddRemark = () => {
    if (!selectedApplication || !remarkText.trim()) return;
    addRemarkMutation.mutate({
      applicationId: selectedApplication.id,
      type: remarkType,
      message: remarkText,
      isInternal
    });
  };

  // Filtering logic
  const filteredApplications = useMemo(() => {
    return applications.filter((app: Application) => {
      const matchesSearch = !searchTerm || 
        app.applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${app.personalDetails?.firstName} ${app.personalDetails?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.personalDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;
      const matchesCountry = countryFilter === 'all' || app.targetCountry === countryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCountry;
    });
  }, [applications, searchTerm, statusFilter, priorityFilter, countryFilter]);

  const getStatusBadgeStyle = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      documents_requested: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      on_hold: 'bg-purple-100 text-purple-800'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const getPriorityBadgeStyle = (priority: string) => {
    const styles = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800', 
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return styles[priority as keyof typeof styles] || styles.normal;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getUniqueCountries = () => {
    const countries = applications.map((app: Application) => app.targetCountry).filter(Boolean);
    return Array.from(new Set(countries)).sort();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading application data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Card className="border-red-200 bg-red-50 m-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Failed to load applications</span>
            </div>
            <p className="text-red-600 mt-2">Please try refreshing the page or contact support if the issue persists.</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <TooltipProvider>
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Application Management Hub</h1>
              <p className="text-gray-600 mt-1">Comprehensive student application tracking and management</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <div className="text-2xl font-bold text-gray-900">{metrics.totalApplications}</div>
                    <p className="text-xs text-blue-600 mt-1">+{metrics.submittedToday} submitted today</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                    <div className="text-2xl font-bold text-gray-900">{metrics.approvalRate}%</div>
                    <p className="text-xs text-green-600 mt-1">{metrics.approvedApplications} approved applications</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <div className="text-2xl font-bold text-gray-900">{metrics.pendingReview}</div>
                    <p className="text-xs text-orange-600 mt-1">Documents requiring review</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Completion</p>
                    <div className="text-2xl font-bold text-gray-900">{metrics.aiCompletion}%</div>
                    <p className="text-xs text-purple-600 mt-1">Average completion score</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="All Statuses" />
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
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="All Priorities" />
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
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {getUniqueCountries().map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="w-full sm:w-auto"
                  >
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </Button>
                </div>
              </div>

              {showAdvancedFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Additional filtering options coming soon...</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Date Range</Button>
                    <Button size="sm" variant="outline">Document Status</Button>
                    <Button size="sm" variant="outline">Study Level</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredApplications.map((application: any) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Student Info Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {application.personalDetails?.firstName || 'Unknown'} {application.personalDetails?.lastName || 'Student'}
                        </h3>
                        <p className="text-sm text-gray-500">{application.applicationNumber}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={`${getStatusBadgeStyle(application.status)} text-xs`}>
                        {application.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={`${getPriorityBadgeStyle(application.priority)} text-xs`}>
                        {application.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Key Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="break-words">{application.targetCountry || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="break-words">{application.studyLevel || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="break-words">{application.preferredIntake || 'Not specified'}</span>
                    </div>
                  </div>

                  {/* Document and Update Status */}
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>Documents: {application.documents?.length || 0}</span>
                    <span>Updated: {formatDate(application.lastUpdated)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openViewDialog(application)}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openStatusDialog(application)}
                      className="text-xs"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Status
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRemarkDialog(application)}
                      className="text-xs"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Remarks
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(application)}
                      className="text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}

          {/* Status Update Dialog */}
          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Update Application Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="documents_requested">Documents Requested</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Add notes about this status change..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStatusUpdate} disabled={updateStatusMutation.isPending}>
                    {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Remark Dialog */}
          <Dialog open={remarkDialogOpen} onOpenChange={setRemarkDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Remark</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="remarkType">Type</Label>
                  <Select value={remarkType} onValueChange={(value: string) => setRemarkType(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="document_request">Document Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="remarkText">Message</Label>
                  <Textarea
                    id="remarkText"
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    placeholder="Enter your remark..."
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="internal"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="internal" className="text-sm">Internal remark (not visible to student)</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setRemarkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRemark} disabled={addRemarkMutation.isPending}>
                    {addRemarkMutation.isPending ? 'Adding...' : 'Add Remark'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* View Details Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
              </DialogHeader>
              {selectedApplication && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Personal Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedApplication.personalDetails?.firstName} {selectedApplication.personalDetails?.lastName}</p>
                        <p><span className="font-medium">Email:</span> {selectedApplication.personalDetails?.email}</p>
                        <p><span className="font-medium">Phone:</span> {selectedApplication.personalDetails?.phoneNumber || 'Not provided'}</p>
                        <p><span className="font-medium">Nationality:</span> {selectedApplication.personalDetails?.nationality}</p>
                        <p><span className="font-medium">Passport:</span> {selectedApplication.personalDetails?.passportNumber}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Academic Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Study Level:</span> {selectedApplication.studyLevel}</p>
                        <p><span className="font-medium">Field:</span> {selectedApplication.fieldOfStudy}</p>
                        <p><span className="font-medium">Target Country:</span> {selectedApplication.targetCountry}</p>
                        <p><span className="font-medium">Preferred Intake:</span> {selectedApplication.preferredIntake}</p>
                        <p><span className="font-medium">Budget Range:</span> {selectedApplication.budgetRange}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Documents ({selectedApplication.documents?.length || 0})</h3>
                    {selectedApplication.documents?.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedApplication.documents.map((doc, index) => (
                          <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                            <FileText className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm break-words flex-1">{doc.name}</span>
                            {doc.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No documents uploaded</p>
                    )}
                  </div>

                  {selectedApplication.remarks && selectedApplication.remarks.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Recent Remarks</h3>
                      <div className="space-y-2">
                        {selectedApplication.remarks.slice(-3).map((remark: any, index: number) => (
                          <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                            <div className="flex justify-between items-start mb-1">
                              <Badge variant="secondary" className="text-xs">{remark.type}</Badge>
                              <span className="text-gray-500 text-xs">{formatDate(remark.createdAt)}</span>
                            </div>
                            <p className="break-words">{remark.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Dialog Placeholder */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Application</DialogTitle>
              </DialogHeader>
              <div className="p-6 text-center text-gray-500">
                <Edit3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Application editing functionality will be implemented based on specific requirements.</p>
                <Button className="mt-4" onClick={() => setEditDialogOpen(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </TooltipProvider>
  );
}