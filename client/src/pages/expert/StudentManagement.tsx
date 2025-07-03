import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ExpertLayout } from '@/components/ExpertLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  MessageSquare,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  BookOpen,
  Activity,
  Star,
  Download,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Student {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  assignmentType: 'primary' | 'secondary';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'active' | 'pending' | 'completed' | 'inactive';
  assignedAt: string;
  lastActivity: string;
  studyLevel: string;
  fieldOfStudy: string;
  preferredCountries: string[];
  profileCompletion: number;
  analysesCount: number;
  consultationsCount: number;
  documentsSubmitted: number;
  applicationStatus: string;
  visaStatus: string;
  notes: string;
  totalSpent: number;
  nextAction: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface StudentActivity {
  id: number;
  studentId: number;
  type: 'analysis' | 'consultation' | 'document' | 'message' | 'application' | 'visa';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'in-progress';
}

export default function StudentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch students assigned to expert
  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/expert/students-detailed'],
    queryFn: async () => {
      // Mock comprehensive student data for CRM demonstration
      return [
        {
          id: 4,
          name: 'Kamal Pandey',
          email: 'iamkamalpandey@gmail.com',
          phoneNumber: '+977-9841234567',
          assignmentType: 'primary',
          priority: 'high',
          status: 'active',
          assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          studyLevel: 'Masters Degree',
          fieldOfStudy: 'Computer Science',
          preferredCountries: ['Canada', 'Australia'],
          profileCompletion: 85,
          analysesCount: 12,
          consultationsCount: 3,
          documentsSubmitted: 8,
          applicationStatus: 'In Progress',
          visaStatus: 'Not Started',
          notes: 'Strong technical background, needs guidance on scholarship applications',
          totalSpent: 450,
          nextAction: 'Schedule visa consultation',
          riskLevel: 'low'
        },
        {
          id: 5,
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phoneNumber: '+1-555-0123',
          assignmentType: 'secondary',
          priority: 'normal',
          status: 'pending',
          assignedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          studyLevel: 'Bachelors Degree',
          fieldOfStudy: 'Business Administration',
          preferredCountries: ['United Kingdom', 'Ireland'],
          profileCompletion: 92,
          analysesCount: 8,
          consultationsCount: 2,
          documentsSubmitted: 5,
          applicationStatus: 'Submitted',
          visaStatus: 'In Review',
          notes: 'Excellent profile, waiting for university response',
          totalSpent: 320,
          nextAction: 'Follow up on application status',
          riskLevel: 'low'
        },
        {
          id: 6,
          name: 'Rajesh Sharma',
          email: 'rajesh.sharma@gmail.com',
          phoneNumber: '+91-9876543210',
          assignmentType: 'primary',
          priority: 'urgent',
          status: 'active',
          assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          studyLevel: 'PhD',
          fieldOfStudy: 'Artificial Intelligence',
          preferredCountries: ['Germany', 'Netherlands'],
          profileCompletion: 78,
          analysesCount: 6,
          consultationsCount: 1,
          documentsSubmitted: 3,
          applicationStatus: 'Documents Required',
          visaStatus: 'Not Started',
          notes: 'Research background needs strengthening, deadline approaching',
          totalSpent: 180,
          nextAction: 'Urgent: Complete document submission',
          riskLevel: 'high'
        },
        {
          id: 7,
          name: 'Emily Chen',
          email: 'emily.chen@example.com',
          phoneNumber: '+86-138-0013-8000',
          assignmentType: 'primary',
          priority: 'normal',
          status: 'completed',
          assignedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          studyLevel: 'Masters Degree',
          fieldOfStudy: 'Data Science',
          preferredCountries: ['Singapore', 'Australia'],
          profileCompletion: 100,
          analysesCount: 15,
          consultationsCount: 5,
          documentsSubmitted: 12,
          applicationStatus: 'Accepted',
          visaStatus: 'Approved',
          notes: 'Successfully placed at NUS Singapore, excellent case study',
          totalSpent: 750,
          nextAction: 'Pre-departure briefing',
          riskLevel: 'low'
        }
      ];
    }
  });

  // Fetch student activities
  const { data: activities = [] } = useQuery<StudentActivity[]>({
    queryKey: ['/api/expert/student-activities', selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return [];
      // Mock activity data
      return [
        {
          id: 1,
          studentId: selectedStudent.id,
          type: 'analysis',
          title: 'Visa Document Analysis',
          description: 'Analyzed visa rejection letter and provided recommendations',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 2,
          studentId: selectedStudent.id,
          type: 'consultation',
          title: 'Study Destination Consultation',
          description: '60-minute consultation on university selection',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 3,
          studentId: selectedStudent.id,
          type: 'document',
          title: 'SOP Review',
          description: 'Statement of Purpose review and feedback',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in-progress'
        }
      ];
    },
    enabled: !!selectedStudent
  });

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.fieldOfStudy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || student.priority === priorityFilter;
    const matchesAssignment = assignmentFilter === 'all' || student.assignmentType === assignmentFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  if (studentsLoading) {
    return (
      <ExpertLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading student management...</div>
        </div>
      </ExpertLayout>
    );
  }

  return (
    <ExpertLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Management</h1>
            <p className="text-muted-foreground">
              Comprehensive CRM system for tracking student activities and progress
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Cases</p>
                  <p className="text-2xl font-bold">{students.filter(s => s.status === 'active').length}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold">{students.filter(s => s.priority === 'urgent' || s.priority === 'high').length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students by name, email, or field..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Study Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-600 rounded-full flex items-center justify-center border-2 border-white">
                            <Users className="h-2 w-2 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.studyLevel}</p>
                        <p className="text-sm text-muted-foreground">{student.fieldOfStudy}</p>
                        <p className="text-xs text-muted-foreground">{student.preferredCountries.join(', ')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(student.priority)}>
                        {student.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Profile</span>
                          <span>{student.profileCompletion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${student.profileCompletion}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student.analysesCount} analyses • {student.consultationsCount} consultations
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(student.lastActivity)}</p>
                        <p className="text-muted-foreground">{student.nextAction}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(student.riskLevel)}>
                        {student.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                {student.name} - Comprehensive Profile
                              </DialogTitle>
                              <DialogDescription>
                                Complete student information and activity tracking
                              </DialogDescription>
                            </DialogHeader>
                            
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="activities">Activities</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="overview" className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Contact Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{student.email}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{student.phoneNumber}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{student.preferredCountries.join(', ')}</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Academic Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{student.studyLevel}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{student.fieldOfStudy}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Profile: {student.profileCompletion}% Complete</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Application Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm">Application:</span>
                                        <Badge>{student.applicationStatus}</Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Visa:</span>
                                        <Badge>{student.visaStatus}</Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Risk Level:</span>
                                        <Badge className={getRiskColor(student.riskLevel)}>{student.riskLevel}</Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Engagement Metrics</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm">Analyses:</span>
                                        <span className="font-medium">{student.analysesCount}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Consultations:</span>
                                        <span className="font-medium">{student.consultationsCount}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Documents:</span>
                                        <span className="font-medium">{student.documentsSubmitted}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Total Spent:</span>
                                        <span className="font-medium">{formatCurrency(student.totalSpent)}</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                                
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-sm">Expert Notes</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm">{student.notes}</p>
                                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border">
                                      <p className="text-sm font-medium text-yellow-800">Next Action Required:</p>
                                      <p className="text-sm text-yellow-700">{student.nextAction}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                              
                              <TabsContent value="activities" className="space-y-4">
                                <div className="space-y-4">
                                  {activities.map((activity) => (
                                    <Card key={activity.id}>
                                      <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-blue-100 rounded-lg">
                                            {activity.type === 'analysis' && <FileText className="h-4 w-4 text-blue-600" />}
                                            {activity.type === 'consultation' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                                            {activity.type === 'document' && <FileText className="h-4 w-4 text-blue-600" />}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <h4 className="font-medium">{activity.title}</h4>
                                              <div className="flex items-center gap-2">
                                                <Badge className={activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                  {activity.status}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">{formatDate(activity.date)}</span>
                                              </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="documents">
                                <div className="text-center py-8">
                                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                  <p className="text-muted-foreground">Document tracking feature coming soon</p>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="analytics">
                                <div className="text-center py-8">
                                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                  <p className="text-muted-foreground">Advanced analytics feature coming soon</p>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ExpertLayout>
  );
}