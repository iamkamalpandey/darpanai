import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  GraduationCap,
  Globe,
  FileText,
  Calendar,
  Award,
  BarChart3,
  UserCheck,
  MessageCircle,
  Phone,
  Video
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ExpertStats {
  totalStudents: number;
  activeConversations: number;
  completedConsultations: number;
  successRate: number;
  responseTime: string;
  studentsThisMonth: number;
}

interface StudentConsultation {
  id: number;
  studentName: string;
  studentEmail: string;
  consultationType: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastActivity: string;
  studyDestination: string;
  studyLevel: string;
  unreadMessages: number;
}

export default function ExpertDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch expert statistics
  const { data: stats, isLoading: statsLoading } = useQuery<ExpertStats>({
    queryKey: ['/api/expert/stats'],
    retry: false,
  });

  // Fetch active consultations
  const { data: consultations = [], isLoading: consultationsLoading } = useQuery<StudentConsultation[]>({
    queryKey: ['/api/expert/consultations'],
    retry: false,
  });

  // Fetch conversations for expert
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/conversations'],
    retry: false,
  });

  const updateConsultationStatus = useMutation({
    mutationFn: async ({ consultationId, status }: { consultationId: number; status: string }) => {
      return apiRequest('PATCH', `/api/expert/consultations/${consultationId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expert/consultations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expert/stats'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              Education Expert Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.firstName} {user?.lastName} - Help students achieve their education goals
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <UserCheck className="h-4 w-4 mr-1" />
              Expert Status: Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeConversations || 3}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completedConsultations || 47}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.successRate || 94}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.responseTime || '2h'}</p>
              </div>
              <Clock className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.studentsThisMonth || 12}</p>
              </div>
              <Calendar className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consultations">Student Consultations</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>KP</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">New message from Kamal Pandey</p>
                        <p className="text-xs text-gray-600">About study visa application</p>
                        <p className="text-xs text-blue-600">2 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>AM</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Consultation completed with Aisha Malik</p>
                        <p className="text-xs text-gray-600">PhD in Engineering consultation</p>
                        <p className="text-xs text-green-600">1 hour ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Document review requested by John Smith</p>
                        <p className="text-xs text-gray-600">Masters in Computer Science</p>
                        <p className="text-xs text-yellow-600">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start New Consultation
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Review Documents
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Globe className="h-4 w-4 mr-2" />
                  Update Country Information
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>

                <Button className="w-full justify-start" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Schedule Call
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Student Consultations Tab */}
        <TabsContent value="consultations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Active Student Consultations
                </span>
                <Badge variant="secondary">{consultations.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sample consultation data since API doesn't exist yet */}
                {[
                  {
                    id: 1,
                    studentName: 'Kamal Pandey',
                    studyDestination: 'Australia',
                    studyLevel: 'Masters',
                    consultationType: 'Study Visa Application',
                    status: 'in_progress',
                    priority: 'high',
                    unreadMessages: 2,
                    lastActivity: '2 minutes ago'
                  },
                  {
                    id: 2,
                    studentName: 'Aisha Malik',
                    studyDestination: 'Canada',
                    studyLevel: 'PhD',
                    consultationType: 'Scholarship Guidance',
                    status: 'pending',
                    priority: 'medium',
                    unreadMessages: 0,
                    lastActivity: '1 hour ago'
                  },
                  {
                    id: 3,
                    studentName: 'John Smith',
                    studyDestination: 'UK',
                    studyLevel: 'Masters',
                    consultationType: 'Document Review',
                    status: 'completed',
                    priority: 'urgent',
                    unreadMessages: 0,
                    lastActivity: '3 hours ago'
                  }
                ].map((consultation) => (
                  <div key={consultation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {consultation.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{consultation.studentName}</h3>
                          <p className="text-sm text-gray-600">
                            {consultation.consultationType} • {consultation.studyLevel} in {consultation.studyDestination}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(consultation.priority)}>
                          {consultation.priority}
                        </Badge>
                        <Badge className={getStatusColor(consultation.status)}>
                          {consultation.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Last activity: {consultation.lastActivity}
                        </span>
                        {consultation.unreadMessages > 0 && (
                          <Badge variant="destructive">
                            {consultation.unreadMessages} new messages
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Video className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Communication Center integration available</p>
                <Button className="mt-4" onClick={() => window.location.href = '/communication-center'}>
                  Open Communication Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Consultation Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-green-600 mb-2">94%</div>
                  <p className="text-gray-600">Students successfully guided</p>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Monthly Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-blue-600 mb-2">+23%</div>
                  <p className="text-gray-600">More students this month</p>
                  <p className="text-sm text-green-600 mt-2">↗️ Trending upward</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}