import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  Filter,
  UserPlus,
  Search,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  User,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  MessageSquare,
  Activity
} from 'lucide-react';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  leadCategory: 'hot' | 'warm' | 'cold';
  studentStage: 'potential' | 'joined_classes' | 'applied' | 'under_processing' | 'failed' | 'success';
  assignedExpertId?: number;
  assignedExpertName?: string;
  assignedAt?: string;
  lastContactDate?: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  source: string;
  notes?: string;
  createdAt: string;
  profileImageUrl?: string;
}

interface Expert {
  id: number;
  firstName: string;
  lastName: string;
  expertType: string;
  specializations: string[];
  isAvailable: boolean;
  currentStudentCount: number;
  maxStudentsAllowed: number;
}

interface AssignmentData {
  studentId: number;
  expertId: number;
  assignmentType: 'primary' | 'secondary' | 'consultation';
  assignmentReason: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
}

export default function AdminStudentManagement() {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    leadCategory: 'all',
    studentStage: 'all',
    assignedExpert: 'all',
    priority: 'all',
    source: ''
  });
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState<Student | null>(null);
  const [assignmentData, setAssignmentData] = useState<Partial<AssignmentData>>({});
  const [bulkAction, setBulkAction] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students with filters
  const { data: studentsResponse, isLoading } = useQuery({
    queryKey: ['/api/admin/students', filters],
    queryFn: () => apiRequest('GET', `/api/admin/students?${new URLSearchParams(filters).toString()}`)
  });
  
  const students: Student[] = Array.isArray(studentsResponse) ? studentsResponse : [];

  // Fetch available experts
  const { data: expertsResponse } = useQuery({
    queryKey: ['/api/admin/experts'],
    queryFn: () => apiRequest('GET', '/api/admin/experts')
  });
  
  const experts: Expert[] = Array.isArray(expertsResponse) ? expertsResponse : [];

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Student> }) =>
      apiRequest('PATCH', `/api/admin/students/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students'] });
      toast({
        title: "Student Updated",
        description: "Student information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update student information.",
        variant: "destructive",
      });
    }
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', '/api/admin/students/bulk-update', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students'] });
      setSelectedStudents([]);
      setBulkAction('');
      toast({
        title: "Bulk Update Successful",
        description: "Selected students have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to perform bulk update.",
        variant: "destructive",
      });
    }
  });

  // Assignment mutation
  const assignmentMutation = useMutation({
    mutationFn: (data: AssignmentData) => 
      apiRequest('POST', '/api/admin/student-expert-assignments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students'] });
      setIsAssignDialogOpen(false);
      setSelectedStudentForAssign(null);
      setAssignmentData({});
      toast({
        title: "Assignment Successful",
        description: "Student has been assigned to expert successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign student to expert.",
        variant: "destructive",
      });
    }
  });

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'potential': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'joined_classes': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'applied': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_processing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <ArrowUp className="w-4 h-4 text-orange-600" />;
      case 'normal': return <Target className="w-4 h-4 text-blue-600" />;
      case 'low': return <ArrowDown className="w-4 h-4 text-gray-600" />;
      default: return <ArrowDown className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleQuickCategoryUpdate = (studentId: number, category: string) => {
    updateStudentMutation.mutate({
      id: studentId,
      data: { leadCategory: category as 'hot' | 'warm' | 'cold' }
    });
  };

  const handleQuickStageUpdate = (studentId: number, stage: string) => {
    updateStudentMutation.mutate({
      id: studentId,
      data: { studentStage: stage as 'potential' | 'joined_classes' | 'applied' | 'under_processing' | 'failed' | 'success' }
    });
  };

  const handleAssignExpert = (student: Student) => {
    setSelectedStudentForAssign(student);
    setAssignmentData({
      studentId: student.id,
      assignmentType: 'primary',
      priority: 'normal'
    });
    setIsAssignDialogOpen(true);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedStudents.length === 0) return;

    const actionData: any = {
      action: bulkAction,
      studentIds: selectedStudents
    };

    if (bulkAction.startsWith('category_')) {
      actionData.data = { leadCategory: bulkAction.split('_')[1] };
    } else if (bulkAction.startsWith('stage_')) {
      actionData.data = { studentStage: bulkAction.split('_')[1] };
    } else if (bulkAction.startsWith('priority_')) {
      actionData.data = { priority: bulkAction.split('_')[1] };
    }

    bulkUpdateMutation.mutate(actionData);
  };

  const filteredStudents = students.filter((student: Student) => {
    const matchesSearch = !filters.search || 
      `${student.firstName} ${student.lastName} ${student.email}`.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.leadCategory || student.leadCategory === filters.leadCategory;
    const matchesStage = !filters.studentStage || student.studentStage === filters.studentStage;
    const matchesExpert = !filters.assignedExpert || 
      student.assignedExpertId?.toString() === filters.assignedExpert;
    const matchesPriority = !filters.priority || student.priority === filters.priority;
    const matchesSource = !filters.source || student.source === filters.source;

    return matchesSearch && matchesCategory && matchesStage && matchesExpert && matchesPriority && matchesSource;
  });

  // CRM Statistics
  const totalStudents = students.length;
  const hotLeads = students.filter(s => s.leadCategory === 'hot').length;
  const warmLeads = students.filter(s => s.leadCategory === 'warm').length;
  const coldLeads = students.filter(s => s.leadCategory === 'cold').length;
  const potentialStudents = students.filter(s => s.studentStage === 'potential').length;
  const appliedStudents = students.filter(s => s.studentStage === 'applied').length;
  const processingStudents = students.filter(s => s.studentStage === 'under_processing').length;
  const successfulStudents = students.filter(s => s.studentStage === 'success').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600 mt-1">Comprehensive CRM system for student lead management</p>
          </div>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* CRM Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                  <p className="text-2xl font-bold text-red-600">{hotLeads}</p>
                </div>
                <Target className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-blue-600">{appliedStudents}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalStudents > 0 ? Math.round((successfulStudents / totalStudents) * 100) : 0}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Bulk Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>

              <Select value={filters.leadCategory} onValueChange={(value) => setFilters({ ...filters, leadCategory: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.studentStage} onValueChange={(value) => setFilters({ ...filters, studentStage: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="potential">Potential</SelectItem>
                  <SelectItem value="joined_classes">Joined Classes</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="under_processing">Under Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.assignedExpert} onValueChange={(value) => setFilters({ ...filters, assignedExpert: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Expert" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experts</SelectItem>
                  {experts.map((expert) => (
                    <SelectItem key={expert.id} value={expert.id.toString()}>
                      {expert.firstName} {expert.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => setFilters({
                search: '', leadCategory: 'all', studentStage: 'all', assignedExpert: 'all', priority: 'all', source: ''
              })}>
                Clear Filters
              </Button>
            </div>

            {/* Bulk Actions Row */}
            {selectedStudents.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-900">
                  {selectedStudents.length} students selected
                </span>
                
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category_hot">Set Category: Hot</SelectItem>
                    <SelectItem value="category_warm">Set Category: Warm</SelectItem>
                    <SelectItem value="category_cold">Set Category: Cold</SelectItem>
                    <SelectItem value="stage_potential">Set Stage: Potential</SelectItem>
                    <SelectItem value="stage_applied">Set Stage: Applied</SelectItem>
                    <SelectItem value="stage_under_processing">Set Stage: Processing</SelectItem>
                    <SelectItem value="priority_urgent">Set Priority: Urgent</SelectItem>
                    <SelectItem value="priority_high">Set Priority: High</SelectItem>
                    <SelectItem value="priority_normal">Set Priority: Normal</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={handleBulkAction} disabled={!bulkAction}>
                  Apply Action
                </Button>
                
                <Button variant="outline" onClick={() => setSelectedStudents([])}>
                  Clear Selection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Students ({filteredStudents.length})</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleStudentSelect(student.id)}
                          className="rounded border-gray-300"
                        />
                        
                        <div className="flex items-center gap-3">
                          {student.profileImageUrl ? (
                            <img 
                              src={student.profileImageUrl} 
                              alt={`${student.firstName} ${student.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {student.firstName} {student.lastName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              {student.email}
                              {student.phoneNumber && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <Phone className="w-4 h-4" />
                                  {student.phoneNumber}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(student.priority)}
                          <Badge className={getCategoryBadgeColor(student.leadCategory)}>
                            {student.leadCategory}
                          </Badge>
                          <Badge className={getStageBadgeColor(student.studentStage)}>
                            {student.studentStage}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignExpert(student)}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                          
                          <Select onValueChange={(value) => handleQuickCategoryUpdate(student.id, value)}>
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hot">Hot</SelectItem>
                              <SelectItem value="warm">Warm</SelectItem>
                              <SelectItem value="cold">Cold</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select onValueChange={(value) => handleQuickStageUpdate(student.id, value)}>
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="potential">Potential</SelectItem>
                              <SelectItem value="joined_classes">Joined Classes</SelectItem>
                              <SelectItem value="applied">Applied</SelectItem>
                              <SelectItem value="under_processing">Processing</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="success">Success</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {student.assignedExpertName && (
                      <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Assigned to: {student.assignedExpertName}
                      </div>
                    )}
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No students found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expert Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Expert</DialogTitle>
            </DialogHeader>
            
            {selectedStudentForAssign && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Student:</p>
                  <p className="text-gray-900">
                    {selectedStudentForAssign.firstName} {selectedStudentForAssign.lastName}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Select Expert</label>
                  <Select 
                    value={assignmentData.expertId?.toString()} 
                    onValueChange={(value) => setAssignmentData({ ...assignmentData, expertId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an expert" />
                    </SelectTrigger>
                    <SelectContent>
                      {experts.filter(e => e.isAvailable).map((expert) => (
                        <SelectItem key={expert.id} value={expert.id.toString()}>
                          {expert.firstName} {expert.lastName} ({expert.expertType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Assignment Type</label>
                  <Select 
                    value={assignmentData.assignmentType} 
                    onValueChange={(value: any) => setAssignmentData({ ...assignmentData, assignmentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose assignment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary Expert</SelectItem>
                      <SelectItem value="secondary">Secondary Expert</SelectItem>
                      <SelectItem value="consultation">Consultation Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Assignment Reason</label>
                  <Textarea 
                    placeholder="Why is this expert being assigned?"
                    value={assignmentData.assignmentReason || ''}
                    onChange={(e) => setAssignmentData({ ...assignmentData, assignmentReason: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      if (assignmentData.expertId && assignmentData.assignmentType && assignmentData.assignmentReason) {
                        assignmentMutation.mutate(assignmentData as AssignmentData);
                      }
                    }}
                    disabled={!assignmentData.expertId || !assignmentData.assignmentType || !assignmentData.assignmentReason}
                  >
                    Assign Expert
                  </Button>
                  <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}