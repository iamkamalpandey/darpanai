import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
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
  Globe
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
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration - replace with actual API calls
  const expertStats: ExpertStats = {
    totalStudents: 24,
    activeConsultations: 8,
    completedThisWeek: 12,
    avgResponseTime: "2.3 hours",
    successRate: 94
  };

  const recentStudents: StudentProfile[] = [
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

  const consultationRequests: ConsultationRequest[] = [
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Expert Dashboard</h1>
                <p className="text-sm text-gray-600">Study Abroad Consultation Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
              <Button size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expertStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">+3 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Consultations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expertStats.activeConsultations}</div>
              <p className="text-xs text-muted-foreground">2 urgent pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expertStats.completedThisWeek}</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expertStats.avgResponseTime}</div>
              <p className="text-xs text-muted-foreground">0.5h improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expertStats.successRate}%</div>
              <p className="text-xs text-muted-foreground">+2% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="consultations">Consultation Queue</TabsTrigger>
            <TabsTrigger value="tools">AI Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Students */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Recent Student Activity
                  </CardTitle>
                  <CardDescription>Latest updates from your assigned students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.fieldOfStudy} • {student.country}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(student.status)} variant="secondary">
                            {student.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{student.lastActivity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href="/expert/students">
                      <Button variant="outline" className="w-full">View All Students</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Consultation Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Pending Consultations
                  </CardTitle>
                  <CardDescription>Consultation requests requiring your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {consultationRequests.map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{consultation.studentName}</p>
                          <p className="text-xs text-gray-500">{getConsultationType(consultation.type)}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge className={getPriorityColor(consultation.priority)} variant="secondary">
                            {consultation.priority}
                          </Badge>
                          <p className="text-xs text-gray-500">{consultation.requestedDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href="/expert/consultations">
                      <Button variant="outline" className="w-full">View All Requests</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Portfolio Management</CardTitle>
                <CardDescription>Manage your assigned students and track their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStudents.map((student) => (
                    <div key={student.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{student.name}</h3>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(student.status)} variant="secondary">
                          {student.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Country</p>
                          <p className="font-medium">{student.country}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Field of Study</p>
                          <p className="font-medium">{student.fieldOfStudy}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Profile Completion</p>
                          <p className="font-medium">{student.profileCompletion}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Documents</p>
                          <p className="font-medium">{student.documentsUploaded} uploaded</p>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button size="sm" variant="outline">View Profile</Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm">Schedule Consultation</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consultation Queue</CardTitle>
                <CardDescription>Manage consultation requests and schedule appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consultationRequests.map((consultation) => (
                    <div key={consultation.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{consultation.studentName}</h3>
                          <p className="text-sm text-gray-500">{getConsultationType(consultation.type)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(consultation.priority)} variant="secondary">
                            {consultation.priority}
                          </Badge>
                          <Badge className={getStatusColor(consultation.status)} variant="secondary">
                            {consultation.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Requested: {consultation.requestedDate}</p>
                        <div className="space-x-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          <Button size="sm">Accept & Schedule</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* AI Document Analysis */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Document Analysis</CardTitle>
                  <CardDescription>AI-powered analysis of academic documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      Academic Transcripts
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      Offer Letters
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      Certificates
                    </div>
                  </div>
                  <Link href="/academic-document-analysis">
                    <Button className="w-full">Start Analysis</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Eligibility Quick Scan */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Eligibility Scan</CardTitle>
                  <CardDescription>Quick eligibility assessment for programs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      GPA Calculations
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      Program Matching
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      Improvement Tips
                    </div>
                  </div>
                  <Link href="/eligibility-quick-scan">
                    <Button className="w-full">Quick Scan</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Scholarship Matching */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Scholarship Matching</CardTitle>
                  <CardDescription>AI-driven scholarship recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      Smart Matching
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      Eligibility Scoring
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      Application Guide
                    </div>
                  </div>
                  <Link href="/scholarship-hub">
                    <Button className="w-full">Find Scholarships</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}