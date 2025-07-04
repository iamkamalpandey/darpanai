// Comprehensive Leads Management System with CRM functionality
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Users, Target, Phone, Mail, Calendar, Edit, Archive, Star, Clock, MessageSquare, TrendingUp, BarChart3, FileText, ChevronDown, ChevronRight, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Lead {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  leadCategory: string;
  leadSource: string;
  studentStage: string;
  assignedCounselorId?: number;
  priority: string;
  interestedCourse?: string;
  studyLevel?: string;
  interestedCountries?: string[];
  budgetRange?: string;
  notes?: string;
  tags?: string[];
  successProbability: number;
  engagementScore: number;
  totalInteractions: number;
  lastEngagementDate?: string;
  satisfactionRating?: number;
  conversionDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: number;
  leadId: number;
  activityType: string;
  activityDescription: string;
  activityDate: string;
  duration?: number;
  outcome?: string;
}

interface LeadNote {
  id: number;
  leadId: number;
  noteType: string;
  noteTitle?: string;
  noteContent: string;
  priority: string;
  isInternal: boolean;
  createdAt: string;
}

export default function LeadsManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedLeads, setExpandedLeads] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch leads with search and filter
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['/api/user-profile/leads', searchQuery, filterCategory, filterStage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterStage !== 'all') params.append('stage', filterStage);
      
      const response = await fetch(`/api/user-profile/leads?${params}`);
      if (!response.ok) throw new Error('Failed to fetch leads');
      return response.json();
    }
  });

  // Fetch lead statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/user-profile/leads/stats'],
    queryFn: async () => {
      const response = await fetch('/api/user-profile/leads/stats');
      if (!response.ok) throw new Error('Failed to fetch lead stats');
      return response.json();
    }
  });

  // Fetch activities for selected lead
  const { data: activities = [] } = useQuery({
    queryKey: ['/api/user-profile/activities', selectedLead?.id],
    queryFn: async () => {
      if (!selectedLead?.id) return [];
      const response = await fetch(`/api/user-profile/activities?leadId=${selectedLead.id}`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
    enabled: !!selectedLead?.id
  });

  // Fetch notes for selected lead
  const { data: notes = [] } = useQuery({
    queryKey: ['/api/user-profile/notes', selectedLead?.id],
    queryFn: async () => {
      if (!selectedLead?.id) return [];
      const response = await fetch(`/api/user-profile/notes?leadId=${selectedLead.id}`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      return response.json();
    },
    enabled: !!selectedLead?.id
  });

  // Add activity mutation
  const addActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      const response = await fetch('/api/user-profile/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add activity');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-profile/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-profile/leads/stats'] });
      toast({ title: 'Success', description: 'Activity added successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      const response = await fetch('/api/user-profile/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add note');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-profile/notes'] });
      toast({ title: 'Success', description: 'Note added successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const toggleLeadExpansion = (leadId: number) => {
    setExpandedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const getLeadCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = leads.filter((lead: Lead) => {
    const matchesSearch = !searchQuery || 
      `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || lead.leadCategory === filterCategory;
    const matchesStage = filterStage === 'all' || lead.studentStage === filterStage;
    
    return matchesSearch && matchesCategory && matchesStage;
  });

  if (leadsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Management</h1>
          <p className="text-muted-foreground">
            Track and manage student leads through their journey
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newLeadsThisWeek} this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hotLeads}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.hotLeads / stats.totalLeads) * 100)}% of total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionsThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                {stats.conversionRate}% conversion rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageEngagementScore}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalInteractions} total interactions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">All Leads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity: Activity) => (
                    <div key={activity.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.activityDescription}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.activityType} • {new Date(activity.activityDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lead Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Lead Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Hot Leads</span>
                        <Badge className="bg-red-100 text-red-800">{stats.hotLeads}</Badge>
                      </div>
                      <Progress value={(stats.hotLeads / stats.totalLeads) * 100} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Warm Leads</span>
                        <Badge className="bg-yellow-100 text-yellow-800">{stats.warmLeads}</Badge>
                      </div>
                      <Progress value={(stats.warmLeads / stats.totalLeads) * 100} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cold Leads</span>
                        <Badge className="bg-blue-100 text-blue-800">{stats.coldLeads}</Badge>
                      </div>
                      <Progress value={(stats.coldLeads / stats.totalLeads) * 100} className="h-2" />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Leads Tab */}
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Leads</CardTitle>
                  <CardDescription>
                    Manage and track all student leads
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search leads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStage} onValueChange={setFilterStage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="inquiry">Inquiry</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLeads.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No leads found matching your criteria
                  </p>
                ) : (
                  filteredLeads.map((lead: Lead) => (
                    <Collapsible key={lead.id}>
                      <CollapsibleTrigger 
                        className="w-full"
                        onClick={() => toggleLeadExpansion(lead.id)}
                      >
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {expandedLeads.includes(lead.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-medium text-gray-900">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{lead.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getLeadCategoryColor(lead.leadCategory)}>
                              {lead.leadCategory}
                            </Badge>
                            <Badge className={getPriorityColor(lead.priority)}>
                              {lead.priority}
                            </Badge>
                            <Badge variant="outline">
                              {lead.studentStage}
                            </Badge>
                            <div className="text-sm text-gray-500">
                              {lead.successProbability}% success
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-4 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                              <h4 className="font-medium mb-2">Contact Information</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </div>
                                {lead.phoneNumber && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" />
                                    {lead.phoneNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Study Preferences</h4>
                              <div className="space-y-1 text-sm">
                                {lead.interestedCourse && (
                                  <p><strong>Course:</strong> {lead.interestedCourse}</p>
                                )}
                                {lead.studyLevel && (
                                  <p><strong>Level:</strong> {lead.studyLevel}</p>
                                )}
                                {lead.budgetRange && (
                                  <p><strong>Budget:</strong> {lead.budgetRange}</p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Engagement</h4>
                              <div className="space-y-1 text-sm">
                                <p><strong>Score:</strong> {lead.engagementScore}/100</p>
                                <p><strong>Interactions:</strong> {lead.totalInteractions}</p>
                                {lead.lastEngagementDate && (
                                  <p><strong>Last Contact:</strong> {new Date(lead.lastEngagementDate).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {lead.notes && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Notes</h4>
                              <p className="text-sm text-gray-600">{lead.notes}</p>
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" onClick={() => setSelectedLead(lead)}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              const content = prompt('Add activity:');
                              if (content) {
                                addActivityMutation.mutate({
                                  leadId: lead.id,
                                  activityType: 'manual',
                                  activityDescription: content,
                                  activityDate: new Date().toISOString()
                                });
                              }
                            }}>
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Add Activity
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              const content = prompt('Add note:');
                              if (content) {
                                addNoteMutation.mutate({
                                  leadId: lead.id,
                                  noteContent: content,
                                  noteType: 'general'
                                });
                              }
                            }}>
                              <FileText className="h-3 w-3 mr-1" />
                              Add Note
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats && (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Conversion Rate</span>
                        <span className="font-bold">{stats.conversionRate}%</span>
                      </div>
                      <Progress value={stats.conversionRate} className="h-3" />
                      
                      <div className="flex items-center justify-between">
                        <span>Average Deal Size</span>
                        <span className="font-bold">${stats.averageDealSize}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Sales Cycle (days)</span>
                        <span className="font-bold">{stats.averageSalesCycle}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats && (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Active Leads</span>
                        <span className="font-bold">{stats.activeLeads}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Follow-ups Required</span>
                        <span className="font-bold">{stats.followUpsRequired}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Response Rate</span>
                        <span className="font-bold">{stats.responseRate}%</span>
                      </div>
                      <Progress value={stats.responseRate} className="h-3" />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}