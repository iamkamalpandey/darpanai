import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

interface Student {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  assignmentType: string;
  priority: string;
  status: string;
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
  riskLevel: string;
  country?: string;
  studyDestination?: string;
  leadCategory?: string;
  studentStage?: string;
}

export default function StudentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch students assigned to expert from database
  const { data: studentsResponse, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/expert/students', { 
      search: searchQuery || undefined, 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      page: 1,
      limit: 20
    }],
  });

  const students = studentsResponse?.students || [];
  const totalStudents = studentsResponse?.total || 0;

  // Transform database data to match component expectations
  const transformedStudents = students.map((assignment: any) => ({
    id: assignment.id,
    name: `${assignment.student.firstName} ${assignment.student.lastName}`,
    email: assignment.student.email,
    phoneNumber: assignment.student.phoneNumber || 'N/A',
    assignmentType: 'primary',
    priority: assignment.priority,
    status: assignment.status,
    assignedAt: assignment.assignedAt,
    lastActivity: assignment.lastContactDate || assignment.assignedAt,
    studyLevel: 'Masters Degree',
    fieldOfStudy: 'Computer Science',
    preferredCountries: [assignment.student.studyDestination || 'N/A'],
    profileCompletion: 85,
    analysesCount: 0,
    consultationsCount: 0,
    documentsSubmitted: 0,
    applicationStatus: 'In Progress',
    visaStatus: 'Not Started',
    notes: assignment.progressNotes || 'No notes available',
    totalSpent: 0,
    nextAction: 'Contact student',
    riskLevel: 'low',
    country: assignment.student.country,
    studyDestination: assignment.student.studyDestination,
    leadCategory: assignment.student.leadCategory,
    studentStage: assignment.student.studentStage
  }));

  const filteredStudents = transformedStudents.filter(student => {
    const matchesSearch = searchQuery === '' || 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || student.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your assigned students and track their progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {filteredStudents.length} of {totalStudents} students
            </span>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
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
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assigned Students ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                    ? 'Try adjusting your filters to see more students.' 
                    : 'No students have been assigned to you yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-medium text-sm">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">
                                {student.studyLevel} • {student.fieldOfStudy}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-2" />
                              {student.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-2" />
                              {student.phoneNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(student.priority)}>
                            {student.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(student.assignedAt)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(student.lastActivity)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full" 
                                style={{ width: `${student.profileCompletion}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{student.profileCompletion}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Details Modal would go here */}
        {selectedStudent && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Student Details: {selectedStudent.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <p className="text-sm text-gray-600">Email: {selectedStudent.email}</p>
                  <p className="text-sm text-gray-600">Phone: {selectedStudent.phoneNumber}</p>
                  <p className="text-sm text-gray-600">Country: {selectedStudent.country}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Study Information</h4>
                  <p className="text-sm text-gray-600">Level: {selectedStudent.studyLevel}</p>
                  <p className="text-sm text-gray-600">Field: {selectedStudent.fieldOfStudy}</p>
                  <p className="text-sm text-gray-600">Destination: {selectedStudent.studyDestination}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedStudent.notes}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => setSelectedStudent(null)}>Close</Button>
                <Button variant="outline">Edit Notes</Button>
                <Button variant="outline">Schedule Consultation</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ExpertLayout>
  );
}