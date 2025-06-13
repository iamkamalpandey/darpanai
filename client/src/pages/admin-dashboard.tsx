import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp,
  Edit,
  Eye,
  Download,
  Filter,
  X,
} from "lucide-react";
import { AnalysisDetailView } from "@/components/AnalysisDetailView";

interface UserData {
  id: number;
  username: string;
  email: string;
  fullName: string;
  qualification: string;
  graduationYear: string;
  phoneNumber: string;
  role: string;
  status: string;
  analysisCount: number;
  maxAnalyses: number;
  createdAt: string;
}

interface UserDetails extends UserData {
  analyses: any[];
  appointments: any[];
}

interface Analysis {
  id: number;
  userId: number;
  fileName: string;
  analysisResults: any;
  createdAt: string;
  isPublic: boolean;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newMaxAnalyses, setNewMaxAnalyses] = useState<number>(0);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [analysisDetailsOpen, setAnalysisDetailsOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all users
  const { data: users, isLoading } = useQuery<UserData[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      return res.json();
    },
  });

  // Fetch user details
  const { data: userDetails } = useQuery<UserDetails>({
    queryKey: ["/api/admin/users", selectedUser?.id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/users/${selectedUser!.id}`);
      return res.json();
    },
    enabled: !!selectedUser && userDetailsOpen,
  });

  // Update user max analyses mutation
  const updateMaxAnalysesMutation = useMutation({
    mutationFn: async ({ userId, maxAnalyses }: { userId: number; maxAnalyses: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/max-analyses`, {
        maxAnalyses,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User's analysis limit updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/status`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  // Export users data mutation
  const exportUsersMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/export/users?format=csv', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'text/csv',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "Users data exported successfully as CSV",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtered users based on search and filters
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];

    return users.filter(user => {
      if (!user) return false;

      // Search filter
      const fullName = user.fullName || '';
      const username = user.username || '';
      const email = user.email || '';
      const matchesSearch = searchTerm === "" || 
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      // Status filter (based on user status and analysis usage)
      const analysisCount = user.analysisCount || 0;
      const maxAnalyses = user.maxAnalyses || 0;
      const userStatus = user.status || 'active';
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && userStatus === 'active') ||
        (statusFilter === "inactive" && userStatus === 'inactive') ||
        (statusFilter === "suspended" && userStatus === 'suspended') ||
        (statusFilter === "limit_reached" && analysisCount >= maxAnalyses);

      // Date filter
      const userDate = user.createdAt ? new Date(user.createdAt) : new Date();
      const matchesDateFrom = !dateFromFilter || userDate >= new Date(dateFromFilter);
      const matchesDateTo = !dateToFilter || userDate <= new Date(dateToFilter + 'T23:59:59');

      return matchesSearch && matchesRole && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [users, searchTerm, roleFilter, statusFilter, dateFromFilter, dateToFilter]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
  };

  const handleUpdateMaxAnalyses = () => {
    if (selectedUser && newMaxAnalyses >= 0) {
      updateMaxAnalysesMutation.mutate({
        userId: selectedUser.id,
        maxAnalyses: newMaxAnalyses,
      });
    }
  };

  const handleViewUserDetails = (user: UserData) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const handleViewAnalysisDetails = (analysis: any) => {
    console.log('Raw analysis data:', analysis);
    
    // The analysis now includes a structured 'results' field from the backend
    let analysisResults = null;
    
    if (analysis.results) {
      // Use the structured results from the backend
      analysisResults = analysis.results;
      console.log('Using structured results from backend:', analysisResults);
    } else if (analysis.analysisResults) {
      // Fallback to analysisResults field
      analysisResults = analysis.analysisResults;
      console.log('Using analysisResults field:', analysisResults);
    } else {
      // Build basic structure from individual fields if structured data isn't available
      analysisResults = {
        summary: analysis.summary || 'Analysis not available',
        rejectionReasons: analysis.rejectionReasons || [],
        recommendations: analysis.recommendations || [],
        nextSteps: analysis.nextSteps || []
      };
      console.log('Built results from individual fields:', analysisResults);
    }
    
    // Convert the analysis data to match the expected format
    const formattedAnalysis: Analysis = {
      id: analysis.id,
      userId: analysis.userId || selectedUser?.id || 0,
      fileName: analysis.filename || analysis.fileName || 'Unknown File',
      analysisResults: analysisResults,
      createdAt: analysis.createdAt,
      isPublic: analysis.isPublic || false,
    };
    
    console.log('Formatted analysis for modal:', formattedAnalysis);
    setSelectedAnalysis(formattedAnalysis);
    setAnalysisDetailsOpen(true);
  };

  const stats = useMemo(() => {
    if (!users || users.length === 0) return null;
    
    return {
      totalUsers: users.length,
      totalAnalyses: users.reduce((sum, user) => sum + (user.analysisCount || 0), 0),
      adminUsers: users.filter(user => user.role === 'admin').length,
      activeUsers: users.filter(user => (user.analysisCount || 0) > 0).length,
    };
  }, [users]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System overview and user management
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adminUsers}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all registered users, their usage, and permissions
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
                <Button
                  onClick={() => exportUsersMutation.mutate()}
                  disabled={exportUsersMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {exportUsersMutation.isPending ? "Exporting..." : "Export CSV"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, username, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
                  <div>
                    <Label htmlFor="role-filter">Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="limit_reached">Limit Reached</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date-from">From Date</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="date-to">To Date</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-4 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Showing {filteredUsers.length} of {users?.length || 0} users
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Analyses Used</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  if (!user || !user.id) return null;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.fullName || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">@{user.username || 'unknown'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                        key={`status-${user.id}-${user.status}`}
                        value={user.status || 'active'}
                        onValueChange={(status) => {
                          if (status && user.id) {
                            updateUserStatusMutation.mutate({ userId: user.id, status });
                          }
                        }}
                        disabled={updateUserStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className={user.analysisCount >= user.maxAnalyses ? 'text-red-600 font-medium' : ''}>
                        {user.analysisCount}
                      </span>
                    </TableCell>
                    <TableCell>{user.maxAnalyses}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUserDetails(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setNewMaxAnalyses(user.maxAnalyses);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Analysis Limit</DialogTitle>
                              <DialogDescription>
                                Change the maximum number of analyses for {user.fullName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">
                                  Current Usage: {user.analysisCount} / {user.maxAnalyses}
                                </label>
                              </div>
                              <div>
                                <label className="text-sm font-medium">New Limit</label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={newMaxAnalyses}
                                  onChange={(e) => setNewMaxAnalyses(parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleUpdateMaxAnalyses}
                                disabled={updateMaxAnalysesMutation.isPending}
                              >
                                {updateMaxAnalysesMutation.isPending ? "Updating..." : "Update Limit"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Details Modal */}
        <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details: {selectedUser?.fullName}</DialogTitle>
              <DialogDescription>
                Complete user information, analysis history, and appointments
              </DialogDescription>
            </DialogHeader>
            {userDetails && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Personal Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Full Name:</strong> {userDetails.fullName}</p>
                      <p><strong>Email:</strong> {userDetails.email}</p>
                      <p><strong>Phone:</strong> {userDetails.phoneNumber || 'Not provided'}</p>
                      <p><strong>Qualification:</strong> {userDetails.qualification || 'Not provided'}</p>
                      <p><strong>Graduation Year:</strong> {userDetails.graduationYear || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Account Status</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Role:</strong> <Badge>{userDetails.role}</Badge></p>
                      <p><strong>Analyses Used:</strong> {userDetails.analysisCount} / {userDetails.maxAnalyses}</p>
                      <p><strong>Joined:</strong> {new Date(userDetails.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Analyses */}
                <div>
                  <h4 className="font-medium mb-2">Analysis History ({userDetails.analyses.length})</h4>
                  <div className="max-h-48 overflow-y-auto">
                    {userDetails.analyses.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>File</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userDetails.analyses.map((analysis) => (
                            <TableRow key={analysis.id}>
                              <TableCell className="font-medium">{analysis.filename || analysis.fileName || 'Unknown File'}</TableCell>
                              <TableCell>{new Date(analysis.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {analysis.summary || 'No summary available'}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('View button clicked for analysis:', analysis);
                                    handleViewAnalysisDetails(analysis);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground">No analyses performed yet</p>
                    )}
                  </div>
                </div>

                {/* Appointments */}
                <div>
                  <h4 className="font-medium mb-2">Appointments ({userDetails.appointments.length})</h4>
                  <div className="max-h-48 overflow-y-auto">
                    {userDetails.appointments.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userDetails.appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell className="font-medium">{appointment.subject}</TableCell>
                              <TableCell>{appointment.preferredContact}</TableCell>
                              <TableCell>{new Date(appointment.requestedDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge variant={appointment.status === 'pending' ? 'secondary' : 'default'}>
                                  {appointment.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground">No appointments booked yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Analysis Details Modal */}
        <Dialog open={analysisDetailsOpen} onOpenChange={setAnalysisDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Analysis Details</DialogTitle>
              <DialogDescription>
                Detailed visa rejection analysis results
              </DialogDescription>
            </DialogHeader>
            {selectedAnalysis && selectedAnalysis.analysisResults && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Analysis for: {selectedAnalysis.fileName}</h4>
                  <p className="text-sm text-muted-foreground">
                    User: {selectedUser?.fullName || 'Unknown User'} (@{selectedUser?.username || 'Unknown'})
                  </p>
                </div>
                <AnalysisDetailView 
                  analysis={{
                    ...selectedAnalysis,
                    user: {
                      username: selectedUser?.username || 'Unknown',
                      firstName: selectedUser?.firstName || 'Unknown',
                      lastName: selectedUser?.lastName || 'User',
                      email: selectedUser?.email || 'Unknown'
                    }
                  }} 
                  showUserInfo={false} 
                />
              </div>
            )}
            {selectedAnalysis && !selectedAnalysis.analysisResults && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No detailed analysis results available for this file.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}