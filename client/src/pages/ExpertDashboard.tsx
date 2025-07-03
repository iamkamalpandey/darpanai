import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Download,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Star,
  Activity,
  Target,
  Award,
  Brain,
  MessageSquare,
  Phone,
  Mail,
  GraduationCap,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ExpertLayout } from '@/components/ExpertLayout';

interface ExpertStats {
  totalStudents: number;
  activeStudents: number;
  completedCases: number;
  successRate: number;
  averageRating: number;
  thisMonth: {
    newStudents: number;
    completedCases: number;
    consultations: number;
  };
}

interface Student {
  id: number;
  name: string;
  email: string;
  assignmentType: string;
  priority: string;
  assignedAt: string;
  status: string;
  studyLevel?: string;
  fieldOfStudy?: string;
  preferredCountries?: string[];
  lastActivity?: string;
  phoneNumber?: string;
  profileCompletion?: number;
}

interface Consultation {
  id: number;
  studentName: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  requestedCountry: string;
  studyLevel: string;
  fieldOfStudy: string;
  message: string;
  studentEmail?: string;
  createdAt: string;
}

export default function ExpertDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isConsultationDialogOpen, setIsConsultationDialogOpen] = useState(false);
  
  // Filter states
  const [studentsSearch, setStudentsSearch] = useState("");
  const [studentsFilter, setStudentsFilter] = useState("all");
  const [consultationsSearch, setConsultationsSearch] = useState("");
  const [consultationsFilter, setConsultationsFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch expert statistics
  const { data: stats, isLoading: statsLoading } = useQuery<ExpertStats>({
    queryKey: ['/api/expert/stats'],
  });

  // Fetch assigned students
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/expert/my-students'],
  });

  // Fetch consultations
  const { data: consultations, isLoading: consultationsLoading } = useQuery<Consultation[]>({
    queryKey: ['/api/expert/consultations'],
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      normal: { color: 'bg-blue-100 text-blue-800', label: 'Normal' },
      low: { color: 'bg-gray-100 text-gray-800', label: 'Low' }
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];

    return students.filter(student => {
      if (!student) return false;

      const matchesSearch = studentsSearch === "" || 
        student.name.toLowerCase().includes(studentsSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(studentsSearch.toLowerCase()) ||
        (student.fieldOfStudy && student.fieldOfStudy.toLowerCase().includes(studentsSearch.toLowerCase()));

      const matchesFilter = studentsFilter === "all" || student.status === studentsFilter;

      return matchesSearch && matchesFilter;
    });
  }, [students, studentsSearch, studentsFilter]);

  // Filtered consultations
  const filteredConsultations = useMemo(() => {
    if (!consultations || !Array.isArray(consultations)) return [];

    return consultations.filter(consultation => {
      if (!consultation) return false;

      const matchesSearch = consultationsSearch === "" || 
        consultation.studentName.toLowerCase().includes(consultationsSearch.toLowerCase()) ||
        consultation.requestedCountry.toLowerCase().includes(consultationsSearch.toLowerCase()) ||
        consultation.fieldOfStudy.toLowerCase().includes(consultationsSearch.toLowerCase());

      const matchesFilter = consultationsFilter === "all" || consultation.status === consultationsFilter;

      return matchesSearch && matchesFilter;
    });
  }, [consultations, consultationsSearch, consultationsFilter]);

  if (statsLoading || studentsLoading || consultationsLoading) {
    return (
      <ExpertLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading expert dashboard...</div>
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
            <h1 className="text-3xl font-bold">Expert Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your students, consultations, and expert activities
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Consultation
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.thisMonth?.newStudents || 0} new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeStudents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently managing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.successRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Application success
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.averageRating || 0}</div>
              <p className="text-xs text-muted-foreground">
                Average student rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Students Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>
                  Manage your assigned students and track their progress
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters & Search */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search students by name, email, or field..."
                    value={studentsSearch}
                    onChange={(e) => setStudentsSearch(e.target.value)}
                  />
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={studentsFilter} onValueChange={setStudentsFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Study Info</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents?.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{student.studyLevel || 'Not specified'}</p>
                          <p className="text-sm text-gray-500">{student.fieldOfStudy || 'Not specified'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{student.assignmentType}</p>
                          {getPriorityBadge(student.priority)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(student.status)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-500">
                          {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : 'No activity'}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsStudentDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredStudents?.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-500">No students match your current filters.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consultations Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Consultations</CardTitle>
                <CardDescription>
                  Manage consultation requests and scheduled sessions
                </CardDescription>
              </div>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Consultation Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search consultations..."
                  value={consultationsSearch}
                  onChange={(e) => setConsultationsSearch(e.target.value)}
                />
              </div>
              <Select value={consultationsFilter} onValueChange={setConsultationsFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Consultations</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Consultations List */}
            <div className="space-y-4">
              {filteredConsultations?.slice(0, 5).map((consultation) => (
                <div key={consultation.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{consultation.studentName}</h3>
                        {getStatusBadge(consultation.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <p className="font-medium">{consultation.preferredDate}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <p className="font-medium">{consultation.preferredTime}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Country:</span>
                          <p className="font-medium">{consultation.requestedCountry}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Level:</span>
                          <p className="font-medium">{consultation.studyLevel}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-500 text-sm">Message:</span>
                        <p className="text-sm mt-1 line-clamp-2">{consultation.message}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedConsultation(consultation);
                          setIsConsultationDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredConsultations?.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
                <p className="text-gray-500">No consultations match your current filters.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Details Dialog */}
        <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                Comprehensive information about {selectedStudent?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm font-medium">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm font-medium">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    {getStatusBadge(selectedStudent.status)}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    {getPriorityBadge(selectedStudent.priority)}
                  </div>
                </div>
                
                {selectedStudent.studyLevel && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Study Level</label>
                    <p className="text-sm font-medium">{selectedStudent.studyLevel}</p>
                  </div>
                )}
                
                {selectedStudent.fieldOfStudy && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Field of Study</label>
                    <p className="text-sm font-medium">{selectedStudent.fieldOfStudy}</p>
                  </div>
                )}
                
                {selectedStudent.preferredCountries && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preferred Countries</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedStudent.preferredCountries.map((country, index) => (
                        <Badge key={index} variant="secondary">{country}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Schedule Call
                  </Button>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Consultation Details Dialog */}
        <Dialog open={isConsultationDialogOpen} onOpenChange={setIsConsultationDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Consultation Details</DialogTitle>
              <DialogDescription>
                Consultation request from {selectedConsultation?.studentName}
              </DialogDescription>
            </DialogHeader>
            {selectedConsultation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Student Name</label>
                    <p className="text-sm font-medium">{selectedConsultation.studentName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    {getStatusBadge(selectedConsultation.status)}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preferred Date</label>
                    <p className="text-sm font-medium">{selectedConsultation.preferredDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preferred Time</label>
                    <p className="text-sm font-medium">{selectedConsultation.preferredTime}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Country</label>
                    <p className="text-sm font-medium">{selectedConsultation.requestedCountry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Study Level</label>
                    <p className="text-sm font-medium">{selectedConsultation.studyLevel}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Field of Study</label>
                  <p className="text-sm font-medium">{selectedConsultation.fieldOfStudy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Message</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">{selectedConsultation.message}</p>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Consultation
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ExpertLayout>
  );
}