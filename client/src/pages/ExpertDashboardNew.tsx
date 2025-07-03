import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Download,
  Plus,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Edit,
  Eye,
  User,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  BookOpen,
  Award,
  Target,
  BarChart3,
  Activity,
  Star,
  Brain,
  Shield,
  Home,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Briefcase,
  HelpCircle,
  Bell,
  UserCheck,
  ClipboardList,
  PieChart,
  Bookmark
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
}

// Sidebar Navigation Item Interface
interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  children?: SidebarItem[];
  badge?: string;
}

// Sidebar Navigation Component
function ExpertSidebar({ currentView, onViewChange }: { currentView: string; onViewChange: (view: string) => void }) {
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['student-management', 'consultation-management']);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: Home,
    },
    {
      id: 'student-management',
      label: 'Student Management',
      icon: Users,
      children: [
        { id: 'my-students', label: 'My Students', icon: UserCheck },
        { id: 'student-assignments', label: 'New Assignments', icon: UserPlus, badge: '2' },
        { id: 'student-progress', label: 'Progress Tracking', icon: Target },
      ]
    },
    {
      id: 'consultation-management',
      label: 'Consultation Services',
      icon: MessageSquare,
      children: [
        { id: 'consultations', label: 'My Consultations', icon: Calendar },
        { id: 'consultation-requests', label: 'New Requests', icon: Clock, badge: '3' },
        { id: 'consultation-history', label: 'History', icon: ClipboardList },
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
    },
    {
      id: 'resources',
      label: 'Resources & Tools',
      icon: BookOpen,
      children: [
        { id: 'document-templates', label: 'Document Templates', icon: FileText },
        { id: 'country-guides', label: 'Country Guides', icon: MapPin },
        { id: 'university-database', label: 'University Database', icon: GraduationCap },
      ]
    },
    {
      id: 'profile-settings',
      label: 'Profile & Settings',
      icon: Settings,
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const isActive = currentView === item.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onViewChange(item.id);
            }
          }}
          className={`w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors ${
            isActive 
              ? 'bg-blue-100 text-blue-700 border-l-3 border-blue-600' 
              : 'text-gray-600 hover:bg-gray-100'
          } ${level > 0 ? 'ml-6 pl-3' : ''}`}
        >
          <div className="flex items-center space-x-3">
            <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            <span className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
              {item.label}
            </span>
            {item.badge && (
              <Badge className="bg-red-100 text-red-800 text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
          {hasChildren && (
            isExpanded ? 
              <ChevronDown className="h-4 w-4 text-gray-500" /> : 
              <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="ml-3 space-y-1 mt-1">
            {item.children?.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      {/* Expert Profile Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Expert Portal</h2>
            <p className="text-sm text-gray-500">Study Abroad Counselor</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Badge className="bg-green-100 text-green-800">
            <Shield className="h-3 w-3 mr-1" />
            Verified Expert
          </Badge>
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-gray-400" />
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="p-4 space-y-2">
        {sidebarItems.map(item => renderSidebarItem(item))}
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help & Support
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-red-600 hover:text-red-700"
            onClick={() => {
              // Logout functionality
              fetch('/api/auth/logout', { method: 'POST' })
                .then(() => {
                  window.location.href = '/';
                })
                .catch(() => {
                  window.location.href = '/';
                });
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ExpertDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [isConsultationDialogOpen, setIsConsultationDialogOpen] = useState(false);
  const [studentsFilter, setStudentsFilter] = useState('all');
  const [studentsSearch, setStudentsSearch] = useState('');
  const [consultationsFilter, setConsultationsFilter] = useState('all');
  const [consultationsSearch, setConsultationsSearch] = useState('');

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
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' }
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

  const renderMainContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
              <p className="text-blue-100 mt-2">Here's your expert dashboard overview for today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('my-students')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5" />
                    <span>My Students</span>
                  </CardTitle>
                  <CardDescription>
                    View and manage your assigned students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View Students
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('consultations')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Consultations</span>
                  </CardTitle>
                  <CardDescription>
                    Manage consultation bookings and sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View Consultations
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('analytics')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    View performance metrics and reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'my-students':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
              <Button onClick={() => setCurrentView('student-assignments')}>
                <UserPlus className="h-4 w-4 mr-2" />
                View New Assignments
              </Button>
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search students..."
                  value={studentsSearch}
                  onChange={(e) => setStudentsSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={studentsFilter} onValueChange={setStudentsFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {students?.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <CardDescription>{student.email}</CardDescription>
                      </div>
                      {getStatusBadge(student.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Assignment Type:</span>
                      <span className="text-sm font-medium">{student.assignmentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Priority:</span>
                      {getPriorityBadge(student.priority)}
                    </div>
                    {student.studyLevel && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Study Level:</span>
                        <span className="text-sm font-medium">{student.studyLevel}</span>
                      </div>
                    )}
                    {student.fieldOfStudy && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Field:</span>
                        <span className="text-sm font-medium">{student.fieldOfStudy}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Assigned:</span>
                      <span className="text-sm font-medium">
                        {new Date(student.assignedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex space-x-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsStudentDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'consultations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">My Consultations</h1>
              <Button onClick={() => setCurrentView('consultation-requests')}>
                <Clock className="h-4 w-4 mr-2" />
                View New Requests
              </Button>
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search consultations..."
                  value={consultationsSearch}
                  onChange={(e) => setConsultationsSearch(e.target.value)}
                  className="w-full"
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
                </SelectContent>
              </Select>
            </div>

            {/* Consultations List */}
            <div className="space-y-4">
              {consultations?.map((consultation) => (
                <Card key={consultation.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
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
                        <div className="mt-3">
                          <span className="text-gray-500 text-sm">Message:</span>
                          <p className="text-sm mt-1">{consultation.message}</p>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Success Rate:</span>
                    <span className="font-medium">{stats?.successRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Average Rating:</span>
                    <span className="font-medium">{stats?.averageRating || 0}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Completed Cases:</span>
                    <span className="font-medium">{stats?.completedCases || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>This Month</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">New Students:</span>
                    <span className="font-medium">{stats?.thisMonth?.newStudents || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Consultations:</span>
                    <span className="font-medium">{stats?.thisMonth?.consultations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Completed Cases:</span>
                    <span className="font-medium">{stats?.thisMonth?.completedCases || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-gold-100 text-gold-800">
                      <Star className="h-3 w-3 mr-1" />
                      Top Performer
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      <Users className="h-3 w-3 mr-1" />
                      Student Favorite
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      High Success Rate
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Coming Soon</h3>
              <p className="text-gray-500">This feature is currently under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ExpertSidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          {renderMainContent()}
        </div>
      </div>

      {/* Student Details Dialog */}
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}