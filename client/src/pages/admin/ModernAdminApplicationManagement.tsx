import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus,
  Eye,
  Edit,
  MapPin,
  GraduationCap,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  Globe,
  BookOpen,
  Target,
  TrendingUp,
  Star,
  Users,
  Brain,
  Lightbulb,
  Filter,
  Search,
  RefreshCw,
  Download,
  MessageSquare,
  Settings,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Shield,
  UserCheck,
  AlertTriangle,
  FileCheck,
  ClipboardList,
  Send,
  Archive,
  MoreHorizontal,
  Flag,
  Clock3,
  CheckSquare,
  XCircle,
  UserX,
  Briefcase,
  School,
  CreditCard,
  FileImage,
  HelpCircle,
  Info,
  ExternalLink,
  Zap,
  Activity,
  PieChart
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';

// Enhanced Application Interface for Admin
interface AdminEnhancedApplication {
  id: number;
  userId: number;
  applicationNumber: string;
  status: 'draft' | 'submitted' | 'under_review' | 'documents_requested' | 'approved' | 'rejected' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetCountry: string;
  studyLevel: string;
  fieldOfStudy: string;
  preferredIntake: string;
  completionPercentage: number;
  adminInsights?: {
    riskAssessment: 'low' | 'medium' | 'high';
    completionScore: number;
    documentScore: number;
    financialScore: number;
    academicScore: number;
    recommendedActions: string[];
    flaggedIssues: string[];
    processingTime: string;
    successProbability: number;
    similarCases: number;
  };
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nationality: string;
    passportNumber: string;
    dateOfBirth: string;
    emergencyContact: string;
  };
  academicDetails: {
    highestQualification: string;
    institution: string;
    graduationYear: string;
    gpa: string;
    gradingSystem: string;
    fieldOfStudy: string;
    previousEducation: any[];
  };
  budgetRange: string;
  fundingSource: string;
  documents: {
    id: string;
    type: string;
    name: string;
    uploadedAt: string;
    verified: boolean;
    size: number;
    adminNotes?: string;
    aiAnalysis?: {
      documentType: string;
      confidence: number;
      extractedData: any;
      authenticity: 'verified' | 'flagged' | 'pending';
      recommendations: string[];
    };
  }[];
  timeline: {
    date: string;
    action: string;
    description: string;
    by: string;
    type: 'system' | 'admin' | 'student';
  }[];
  adminNotes: {
    id: string;
    message: string;
    type: 'internal' | 'student_visible' | 'system' | 'urgent';
    createdAt: string;
    createdBy: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  submittedAt?: string;
  lastUpdated: string;
  assignedCounselor?: string;
  estimatedProcessingTime: string;
  tags: string[];
  workflowStage: string;
  nextAction: string;
  slaStatus: 'on_time' | 'at_risk' | 'overdue';
}

// Admin Action Dialogs
const StatusUpdateDialog = ({ 
  application, 
  isOpen, 
  onClose, 
  onUpdate 
}: { 
  application: AdminEnhancedApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (applicationId: number, status: string, notes: string) => void;
}) => {
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [notifyStudent, setNotifyStudent] = useState(true);

  const handleSubmit = () => {
    if (!application || !newStatus) return;
    onUpdate(application.id, newStatus, notes);
    setNotes('');
    setNewStatus('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Update Application Status
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Current Status</Label>
            <div className="p-2 bg-gray-50 rounded border">
              <Badge className="capitalize">
                {application?.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div>
            <Label>New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
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
            <Label>Status Update Notes</Label>
            <Textarea
              placeholder="Add notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notify-student"
              checked={notifyStudent}
              onChange={(e) => setNotifyStudent(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="notify-student" className="text-sm">
              Notify student via email
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!newStatus}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DocumentRequestDialog = ({ 
  application, 
  isOpen, 
  onClose, 
  onRequest 
}: { 
  application: AdminEnhancedApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onRequest: (applicationId: number, documents: string[], message: string) => void;
}) => {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [customDocument, setCustomDocument] = useState('');
  const [message, setMessage] = useState('');

  const commonDocuments = [
    'Official Transcript',
    'Passport Copy',
    'English Proficiency Test',
    'Statement of Purpose',
    'Letters of Recommendation',
    'Financial Documents',
    'Resume/CV',
    'Portfolio',
    'Medical Certificate',
    'Police Clearance'
  ];

  const handleDocumentToggle = (doc: string) => {
    setSelectedDocuments(prev => 
      prev.includes(doc) 
        ? prev.filter(d => d !== doc)
        : [...prev, doc]
    );
  };

  const handleAddCustom = () => {
    if (customDocument.trim()) {
      setSelectedDocuments(prev => [...prev, customDocument.trim()]);
      setCustomDocument('');
    }
  };

  const handleSubmit = () => {
    if (!application || selectedDocuments.length === 0) return;
    onRequest(application.id, selectedDocuments, message);
    setSelectedDocuments([]);
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-orange-600" />
            Request Additional Documents
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Required Documents</Label>
            <p className="text-sm text-gray-600 mb-3">
              Select documents to request from the student
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {commonDocuments.map((doc) => (
                <div key={doc} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`doc-${doc}`}
                    checked={selectedDocuments.includes(doc)}
                    onChange={() => handleDocumentToggle(doc)}
                    className="rounded"
                  />
                  <Label htmlFor={`doc-${doc}`} className="text-sm">
                    {doc}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Custom Document</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom document name..."
                value={customDocument}
                onChange={(e) => setCustomDocument(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Button onClick={handleAddCustom} size="sm" disabled={!customDocument.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {selectedDocuments.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Selected Documents:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDocuments.map((doc) => (
                  <Badge key={doc} variant="secondary" className="flex items-center gap-1">
                    {doc}
                    <button
                      onClick={() => handleDocumentToggle(doc)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Message to Student</Label>
            <Textarea
              placeholder="Explain what documents are needed and why..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={selectedDocuments.length === 0}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Application Card for Admin
const AdminApplicationCard = ({ 
  application, 
  onStatusUpdate,
  onDocumentRequest,
  onViewDetails 
}: { 
  application: AdminEnhancedApplication;
  onStatusUpdate: () => void;
  onDocumentRequest: () => void;
  onViewDetails: () => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'documents_requested': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSLAColor = (sla: string) => {
    switch (sla) {
      case 'on_time': return 'text-green-600';
      case 'at_risk': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{application.applicationNumber}</h3>
            <p className="text-sm text-gray-600">{application.personalDetails.firstName} {application.personalDetails.lastName}</p>
            <p className="text-xs text-gray-500">{application.personalDetails.email}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(application.status)}>
              {application.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(application.priority)}>
              {application.priority.toUpperCase()}
            </Badge>
            {application.slaStatus && (
              <div className={`text-xs font-medium ${getSLAColor(application.slaStatus)}`}>
                SLA: {application.slaStatus.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{application.targetCountry}</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{application.studyLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 truncate">{application.fieldOfStudy}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{application.preferredIntake}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Completion</span>
              <span className="text-sm font-medium">{application.completionPercentage}%</span>
            </div>
            <Progress value={application.completionPercentage} className="h-2" />
          </div>

          {application.adminInsights && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Admin Insights</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-blue-600" />
                  <span>Success: {application.adminInsights.successProbability}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-orange-600" />
                  <span>Risk: {application.adminInsights.riskAssessment}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-green-600" />
                  <span>ETA: {application.adminInsights.processingTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-purple-600" />
                  <span>Similar: {application.adminInsights.similarCases}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm" onClick={onStatusUpdate} className="flex-1">
              <Shield className="h-4 w-4 mr-1" />
              Update
            </Button>
            <Button variant="outline" size="sm" onClick={onDocumentRequest}>
              <FileCheck className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Admin Application Management Component
export default function ModernAdminApplicationManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedApplication, setSelectedApplication] = useState<AdminEnhancedApplication | null>(null);
  
  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch applications
  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['/api/admin/applications'],
    staleTime: 30000,
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/admin/applications/stats'],
    staleTime: 60000,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { applicationId: number; status: string; notes: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/applications/${data.applicationId}/status`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update application status.",
        variant: "destructive",
      });
    }
  });

  // Request documents mutation
  const requestDocumentsMutation = useMutation({
    mutationFn: async (data: { applicationId: number; documents: string[]; message: string }) => {
      const response = await apiRequest('POST', `/api/admin/applications/${data.applicationId}/request-documents`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
      toast({
        title: "Document Request Sent",
        description: "Document request has been sent to the student.",
      });
    },
    onError: () => {
      toast({
        title: "Request Failed",
        description: "Failed to send document request.",
        variant: "destructive",
      });
    }
  });

  const applications = (applicationsData as any)?.applications || [];
  const stats = (statsData as any) || {
    total: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    documents_requested: 0,
    high_priority: 0,
    overdue: 0,
    avg_processing_time: '5 days'
  };

  // Filter applications
  const filteredApplications = applications.filter((app: AdminEnhancedApplication) => {
    const matchesSearch = 
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${app.personalDetails.firstName} ${app.personalDetails.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.personalDetails.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.fieldOfStudy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;
    const matchesCountry = countryFilter === 'all' || app.targetCountry === countryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCountry;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case 'oldest':
        return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
      case 'priority':
        const priorityOrder: { [key: string]: number } = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      case 'completion':
        return b.completionPercentage - a.completionPercentage;
      case 'sla':
        const slaOrder: { [key: string]: number } = { overdue: 3, at_risk: 2, on_time: 1 };
        return (slaOrder[b.slaStatus as keyof typeof slaOrder] || 0) - (slaOrder[a.slaStatus as keyof typeof slaOrder] || 0);
      default:
        return 0;
    }
  });

  const handleStatusUpdate = (applicationId: number, status: string, notes: string) => {
    updateStatusMutation.mutate({ applicationId, status, notes });
  };

  const handleDocumentRequest = (applicationId: number, documents: string[], message: string) => {
    requestDocumentsMutation.mutate({ applicationId, documents, message });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Application Management Center
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive admin dashboard for managing student applications
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Applications</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                  <p className="text-xs text-blue-600">+12% from last month</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Under Review</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.under_review}</p>
                  <p className="text-xs text-yellow-600">Avg: {stats.avg_processing_time}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Approved</p>
                  <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
                  <p className="text-xs text-green-600">89% success rate</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">High Priority</p>
                  <p className="text-2xl font-bold text-red-800">{stats.high_priority}</p>
                  <p className="text-xs text-red-600">{stats.overdue} overdue</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedApplications.slice(0, 6).map((application) => (
                    <AdminApplicationCard
                      key={application.id}
                      application={application}
                      onStatusUpdate={() => {
                        setSelectedApplication(application);
                        setStatusDialogOpen(true);
                      }}
                      onDocumentRequest={() => {
                        setSelectedApplication(application);
                        setDocumentDialogOpen(true);
                      }}
                      onViewDetails={() => {
                        setSelectedApplication(application);
                        setDetailsDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search applications, students, or emails..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
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
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="completion">Completion</SelectItem>
                      <SelectItem value="sla">SLA Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Applications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedApplications.map((application) => (
                <AdminApplicationCard
                  key={application.id}
                  application={application}
                  onStatusUpdate={() => {
                    setSelectedApplication(application);
                    setStatusDialogOpen(true);
                  }}
                  onDocumentRequest={() => {
                    setSelectedApplication(application);
                    setDocumentDialogOpen(true);
                  }}
                  onViewDetails={() => {
                    setSelectedApplication(application);
                    setDetailsDialogOpen(true);
                  }}
                />
              ))}
            </div>

            {filteredApplications.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Workflow Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Lightbulb className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Workflow Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    Automated workflow management and routing features
                  </p>
                  <Button variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    Get Notified
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Application Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <PieChart className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    Detailed reports and insights on application trends
                  </p>
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Preview Features
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <StatusUpdateDialog
          application={selectedApplication}
          isOpen={statusDialogOpen}
          onClose={() => {
            setStatusDialogOpen(false);
            setSelectedApplication(null);
          }}
          onUpdate={handleStatusUpdate}
        />

        <DocumentRequestDialog
          application={selectedApplication}
          isOpen={documentDialogOpen}
          onClose={() => {
            setDocumentDialogOpen(false);
            setSelectedApplication(null);
          }}
          onRequest={handleDocumentRequest}
        />
      </div>
    </AdminLayout>
  );
}