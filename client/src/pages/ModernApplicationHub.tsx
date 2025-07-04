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
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

// Enhanced Application Interface
interface EnhancedApplication {
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
  aiInsights?: {
    completionScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendedActions: string[];
    missingDocuments: string[];
    strengthsAnalysis: string[];
    weaknessesAnalysis: string[];
    successProbability: number;
    nextSteps: string[];
  };
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nationality: string;
    passportNumber: string;
    dateOfBirth: string;
  };
  academicDetails: {
    highestQualification: string;
    institution: string;
    graduationYear: string;
    gpa: string;
    gradingSystem: string;
    fieldOfStudy: string;
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
    aiAnalysis?: {
      documentType: string;
      confidence: number;
      extractedData: any;
      recommendations: string[];
    };
  }[];
  timeline: {
    date: string;
    action: string;
    description: string;
    by: string;
  }[];
  notes: {
    id: string;
    message: string;
    type: 'internal' | 'student_visible' | 'system';
    createdAt: string;
    createdBy: string;
  }[];
  submittedAt?: string;
  lastUpdated: string;
  assignedCounselor?: string;
  estimatedProcessingTime: string;
  tags: string[];
}

// Quick Action Components
const QuickStartApplication = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    studyLevel: '',
    fieldOfStudy: '',
    targetCountry: '',
    preferredIntake: '',
    budgetRange: '',
    fundingSource: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createApplicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/applications', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      toast({
        title: "Application Created Successfully",
        description: `Application ${data.applicationNumber} has been created. You can now complete your details.`,
      });
      setIsOpen(false);
      setActiveStep(1);
      setFormData({
        studyLevel: '',
        fieldOfStudy: '',
        targetCountry: '',
        preferredIntake: '',
        budgetRange: '',
        fundingSource: ''
      });
    },
    onError: () => {
      toast({
        title: "Error Creating Application",
        description: "Failed to create your application. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!formData.studyLevel || !formData.fieldOfStudy || !formData.targetCountry) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    createApplicationMutation.mutate(formData);
  };

  const steps = [
    { id: 1, title: 'Study Goals', fields: ['studyLevel', 'fieldOfStudy'] },
    { id: 2, title: 'Destination', fields: ['targetCountry', 'preferredIntake'] },
    { id: 3, title: 'Financing', fields: ['budgetRange', 'fundingSource'] }
  ];

  const currentStep = steps.find(s => s.id === activeStep);
  const progress = (activeStep / steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Quick Start New Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Quick Application Setup
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {activeStep} of {steps.length}: {currentStep?.title}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step 1: Study Goals */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <GraduationCap className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">What do you want to study?</h3>
                <p className="text-sm text-gray-600">Tell us about your academic goals</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studyLevel">Study Level *</Label>
                  <Select value={formData.studyLevel} onValueChange={(value) => setFormData({...formData, studyLevel: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select study level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="foundation">Foundation</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="fieldOfStudy">Field of Study *</Label>
                  <Select value={formData.fieldOfStudy} onValueChange={(value) => setFormData({...formData, fieldOfStudy: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field of study" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="business">Business Administration</SelectItem>
                      <SelectItem value="medicine">Medicine</SelectItem>
                      <SelectItem value="arts">Arts & Humanities</SelectItem>
                      <SelectItem value="science">Natural Sciences</SelectItem>
                      <SelectItem value="social-science">Social Sciences</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="law">Law</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Destination */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Globe className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Where do you want to study?</h3>
                <p className="text-sm text-gray-600">Choose your destination and timing</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="targetCountry">Target Country *</Label>
                  <Select value={formData.targetCountry} onValueChange={(value) => setFormData({...formData, targetCountry: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="australia">Australia</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="germany">Germany</SelectItem>
                      <SelectItem value="france">France</SelectItem>
                      <SelectItem value="netherlands">Netherlands</SelectItem>
                      <SelectItem value="new-zealand">New Zealand</SelectItem>
                      <SelectItem value="ireland">Ireland</SelectItem>
                      <SelectItem value="singapore">Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="preferredIntake">Preferred Intake</Label>
                  <Select value={formData.preferredIntake} onValueChange={(value) => setFormData({...formData, preferredIntake: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select intake" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="february-2025">February 2025</SelectItem>
                      <SelectItem value="july-2025">July 2025</SelectItem>
                      <SelectItem value="september-2025">September 2025</SelectItem>
                      <SelectItem value="february-2026">February 2026</SelectItem>
                      <SelectItem value="july-2026">July 2026</SelectItem>
                      <SelectItem value="september-2026">September 2026</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Financing */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <DollarSign className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">How will you fund your studies?</h3>
                <p className="text-sm text-gray-600">Financial planning is crucial for your success</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budgetRange">Budget Range</Label>
                  <Select value={formData.budgetRange} onValueChange={(value) => setFormData({...formData, budgetRange: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-20k">Under $20,000</SelectItem>
                      <SelectItem value="20k-40k">$20,000 - $40,000</SelectItem>
                      <SelectItem value="40k-60k">$40,000 - $60,000</SelectItem>
                      <SelectItem value="60k-80k">$60,000 - $80,000</SelectItem>
                      <SelectItem value="80k-100k">$80,000 - $100,000</SelectItem>
                      <SelectItem value="over-100k">Over $100,000</SelectItem>
                      <SelectItem value="no-limit">No specific limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="fundingSource">Funding Source</Label>
                  <Select value={formData.fundingSource} onValueChange={(value) => setFormData({...formData, fundingSource: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self-funded">Self-funded</SelectItem>
                      <SelectItem value="family-funded">Family-funded</SelectItem>
                      <SelectItem value="scholarship">Scholarship</SelectItem>
                      <SelectItem value="education-loan">Education Loan</SelectItem>
                      <SelectItem value="employer-sponsored">Employer-sponsored</SelectItem>
                      <SelectItem value="government-grant">Government Grant</SelectItem>
                      <SelectItem value="combination">Combination of sources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
            >
              Previous
            </Button>
            
            {activeStep < steps.length ? (
              <Button
                onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
                disabled={
                  (activeStep === 1 && (!formData.studyLevel || !formData.fieldOfStudy)) ||
                  (activeStep === 2 && !formData.targetCountry)
                }
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createApplicationMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {createApplicationMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Application
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Application Card Component
const ApplicationCard = ({ application }: { application: EnhancedApplication }) => {
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

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{application.applicationNumber}</h3>
            <p className="text-sm text-gray-600">{application.personalDetails.firstName} {application.personalDetails.lastName}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(application.status)}>
              {application.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(application.priority)}>
              {application.priority.toUpperCase()}
            </Badge>
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
            <span className="text-sm text-gray-600">{application.fieldOfStudy}</span>
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

          {application.aiInsights && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">AI Insights</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-blue-600" />
                  <span>Success: {application.aiInsights.successProbability}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-orange-600" />
                  <span>Risk: {application.aiInsights.riskLevel}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              Continue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Application Hub Component
export default function ModernApplicationHub() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  const { toast } = useToast();

  // Fetch applications
  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['/api/applications'],
    staleTime: 30000,
  });

  // Fetch application statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/applications/stats'],
    staleTime: 60000,
  });

  const applications = (applicationsData as any)?.applications || [];
  const stats = (statsData as any) || {
    total: 0,
    draft: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    completion_rate: 0,
    avg_processing_time: 0
  };

  // Filter applications
  const filteredApplications = applications.filter((app: EnhancedApplication) => {
    const matchesSearch = 
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${app.personalDetails.firstName} ${app.personalDetails.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.fieldOfStudy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.targetCountry.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesCountry = countryFilter === 'all' || app.targetCountry === countryFilter;
    
    return matchesSearch && matchesStatus && matchesCountry;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case 'oldest':
        return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
      case 'completion':
        return b.completionPercentage - a.completionPercentage;
      case 'priority':
        const priorityOrder: { [key: string]: number } = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your applications...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Application Hub
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your study abroad applications with AI-powered insights
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
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
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Approved</p>
                  <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Under Review</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.under_review}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.completion_rate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Applications
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickStartApplication />
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat with AI Counselor
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-4">Get started by creating your first application</p>
                    <QuickStartApplication />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedApplications.slice(0, 6).map((application) => (
                      <ApplicationCard key={application.id} application={application} />
                    ))}
                  </div>
                )}
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
                      placeholder="Search applications..."
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
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filter by country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="completion">Completion %</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Applications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
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

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Lightbulb className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    AI-powered insights and recommendations for your applications
                  </p>
                  <Button variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    Get Notified
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}