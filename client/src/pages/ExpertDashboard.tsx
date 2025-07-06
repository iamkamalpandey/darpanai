import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  Users, 
  FileText, 
  Award, 
  TrendingUp, 
  MessageSquare, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Globe,
  Bell,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  ArrowUp,
  ArrowDown,
  Plus,
  Search,
  Filter,
  Menu,
  X,
  Home,
  BookUser,
  GraduationCap,
  FileSearch,
  UserCheck
} from "lucide-react";

interface StudentProfile {
  id: number;
  name: string;
  email: string;
  country: string;
  fieldOfStudy: string;
  profileCompletion: number;
  documentsUploaded: number;
  lastActivity: string;
  status: 'active' | 'pending' | 'completed';
}

interface ConsultationRequest {
  id: number;
  studentName: string;
  type: 'document_analysis' | 'eligibility_scan' | 'scholarship_matching' | 'general_consultation';
  priority: 'high' | 'medium' | 'low';
  requestedDate: string;
  status: 'pending' | 'scheduled' | 'completed';
}

interface ExpertStats {
  totalStudents: number;
  activeConsultations: number;
  completedThisWeek: number;
  avgResponseTime: string;
  successRate: number;
}

export default function ExpertDashboard() {
  const [, setLocation] = useLocation();
  const [activeNavItem, setActiveNavItem] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch real expert stats from database
  const { data: expertStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/expert/stats'],
    queryFn: () => fetch('/api/expert/stats').then(res => res.json())
  });

  // Fetch recent students from database
  const { data: recentStudents, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/expert/students/recent'],
    queryFn: () => fetch('/api/expert/students/recent').then(res => res.json())
  });

  // Fetch consultation requests from database
  const { data: consultationRequests, isLoading: consultationsLoading } = useQuery({
    queryKey: ['/api/expert/consultations/pending'],
    queryFn: () => fetch('/api/expert/consultations/pending').then(res => res.json())
  });

  // Fallback data for when API is not ready
  const fallbackStats: ExpertStats = {
    totalStudents: 24,
    activeConsultations: 8,
    completedThisWeek: 12,
    avgResponseTime: "2.3 hours",
    successRate: 94
  };

  const fallbackStudents: StudentProfile[] = [
    {
      id: 1,
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      country: "Nepal",
      fieldOfStudy: "Computer Science",
      profileCompletion: 85,
      documentsUploaded: 4,
      lastActivity: "2 hours ago",
      status: 'active'
    },
    {
      id: 2,
      name: "Ahmed Hassan",
      email: "ahmed.hassan@email.com",
      country: "Bangladesh",
      fieldOfStudy: "Business Administration",
      profileCompletion: 60,
      documentsUploaded: 2,
      lastActivity: "1 day ago",
      status: 'pending'
    },
    {
      id: 3,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      country: "Pakistan",
      fieldOfStudy: "Engineering",
      profileCompletion: 100,
      documentsUploaded: 6,
      lastActivity: "3 hours ago",
      status: 'completed'
    }
  ];

  const fallbackConsultations: ConsultationRequest[] = [
    {
      id: 1,
      studentName: "Priya Sharma",
      type: 'document_analysis',
      priority: 'high',
      requestedDate: "2025-07-06",
      status: 'pending'
    },
    {
      id: 2,
      studentName: "Ahmed Hassan",
      type: 'eligibility_scan',
      priority: 'medium',
      requestedDate: "2025-07-07",
      status: 'scheduled'
    },
    {
      id: 3,
      studentName: "Sarah Johnson",
      type: 'scholarship_matching',
      priority: 'low',
      requestedDate: "2025-07-08",
      status: 'pending'
    }
  ];

  // Use data from API or fallback
  const currentStats = expertStats || fallbackStats;
  const currentStudents = recentStudents || fallbackStudents;
  const currentConsultations = consultationRequests || fallbackConsultations;

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/expert' },
    { id: 'students', label: 'Student Management', icon: Users, href: '/expert/students' },
    { id: 'consultations', label: 'Consultations', icon: MessageSquare, href: '/expert/consultations' },
    { id: 'documents', label: 'Document Review', icon: FileText, href: '/expert/documents' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/expert/analytics' },
    { id: 'resources', label: 'Resources', icon: BookOpen, href: '/expert/resources' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/expert/settings' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConsultationType = (type: string) => {
    switch (type) {
      case 'document_analysis':
        return 'Document Analysis';
      case 'eligibility_scan':
        return 'Eligibility Scan';
      case 'scholarship_matching':
        return 'Scholarship Matching';
      case 'general_consultation':
        return 'General Consultation';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'} flex flex-col shadow-sm`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-lg">D</span>
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-semibold text-gray-800">DarpanAI</h1>
              <p className="text-sm text-gray-500">Expert Portal</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavItem === item.id;
              return (
                <Link key={item.id} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive 
                        ? 'bg-orange-50 text-orange-600 border-l-3 border-orange-500' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
                    }`}
                    onClick={() => setActiveNavItem(item.id)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">EX</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Expert User</p>
                <p className="text-xs text-gray-500">Study Abroad Expert</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Expert Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your students.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                New Consultation
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800">{currentStats.totalStudents}</div>
                <div className="flex items-center text-sm mt-2">
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+3</span>
                  <span className="text-gray-500 ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Consultations</CardTitle>
                <MessageSquare className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800">{currentStats.activeConsultations}</div>
                <div className="flex items-center text-sm mt-2">
                  <AlertCircle className="h-3 w-3 text-orange-500 mr-1" />
                  <span className="text-orange-600 font-medium">2 urgent</span>
                  <span className="text-gray-500 ml-1">pending</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed This Week</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800">{currentStats.completedThisWeek}</div>
                <div className="flex items-center text-sm mt-2">
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+2</span>
                  <span className="text-gray-500 ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800">{currentStats.successRate}%</div>
                <div className="flex items-center text-sm mt-2">
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+2%</span>
                  <span className="text-gray-500 ml-1">this month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Student Activity */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-500" />
                      Recent Student Activity
                    </CardTitle>
                    <CardDescription>Latest updates from your assigned students</CardDescription>
                  </div>
                  <Link href="/expert/students">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading students...</p>
                    </div>
                  ) : (
                    currentStudents.slice(0, 5).map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.fieldOfStudy} • {student.country}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{student.lastActivity}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Consultations */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Pending Consultations
                    </CardTitle>
                    <CardDescription>Consultation requests requiring attention</CardDescription>
                  </div>
                  <Link href="/expert/consultations">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consultationsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading consultations...</p>
                    </div>
                  ) : (
                    currentConsultations.slice(0, 5).map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium text-sm text-gray-800">{consultation.studentName}</p>
                          <p className="text-xs text-gray-500">{getConsultationType(consultation.type)}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge className={getPriorityColor(consultation.priority)}>
                            {consultation.priority}
                          </Badge>
                          <p className="text-xs text-gray-500">{consultation.requestedDate}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>Frequently used tools and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/expert/students">
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-2">
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Manage Students</span>
                  </Button>
                </Link>
                <Link href="/expert/consultations">
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">Schedule Meeting</span>
                  </Button>
                </Link>
                <Link href="/expert/documents">
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Review Documents</span>
                  </Button>
                </Link>
                <Link href="/expert/analytics">
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}