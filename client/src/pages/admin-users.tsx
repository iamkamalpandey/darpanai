import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Eye, Edit, Download, FileText, Calendar, Mail, Phone, MapPin, GraduationCap, Filter } from "lucide-react";
import { format, isAfter, isBefore, parseISO, subDays, subMonths, subYears } from "date-fns";

interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  studyDestination: string;
  startDate: string;
  city: string;
  country: string;
  counsellingMode: string;
  fundingSource: string;
  studyLevel: string;
  role: string;
  status: string;
  analysisCount: number;
  maxAnalyses: number;
  createdAt: string;
}

interface AnalysisData {
  id: number;
  userId: number;
  fileName: string;
  analysisResults: any;
  createdAt: string;
  isPublic: boolean;
}

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<UserData[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch user analyses when user is selected
  const { data: userAnalyses = [] } = useQuery<AnalysisData[]>({
    queryKey: ["/api/analyses", selectedUser?.id],
    enabled: !!selectedUser?.id,
  });

  // Update user max analyses mutation
  const updateMaxAnalysesMutation = useMutation({
    mutationFn: (data: { userId: number; maxAnalyses: number }) =>
      apiRequest(`/api/admin/users/${data.userId}/max-analyses`, "PATCH", { maxAnalyses: data.maxAnalyses }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Analysis limit updated successfully" });
      setEditingField(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update analysis limit", variant: "destructive" });
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: (data: { userId: number; role: string }) =>
      apiRequest(`/api/admin/users/${data.userId}/role`, "PATCH", { role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User role updated successfully" });
      setEditingField(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user role", variant: "destructive" });
    },
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { userId: number; status: string }) =>
      apiRequest(`/api/admin/users/${data.userId}/status`, "PATCH", { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User status updated successfully" });
      setEditingField(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user status", variant: "destructive" });
    },
  });

  // Filter users based on all criteria
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = searchTerm === "" ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studyDestination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.country.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    // Status filter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    // Date filter
    const userDate = parseISO(user.createdAt);
    const now = new Date();
    let matchesDate = true;

    switch (dateFilter) {
      case "today":
        matchesDate = format(userDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
        break;
      case "week":
        matchesDate = isAfter(userDate, subDays(now, 7));
        break;
      case "month":
        matchesDate = isAfter(userDate, subMonths(now, 1));
        break;
      case "year":
        matchesDate = isAfter(userDate, subYears(now, 1));
        break;
      case "all":
      default:
        matchesDate = true;
    }

    return matchesSearch && matchesRole && matchesStatus && matchesDate;
  });

  // CSV export functionality
  const exportUsersCSV = () => {
    const csvData = filteredUsers.map(user => ({
      ID: user.id,
      Username: user.username,
      'First Name': user.firstName,
      'Last Name': user.lastName,
      Email: user.email,
      'Phone Number': user.phoneNumber,
      'Study Destination': user.studyDestination,
      'Study Level': user.studyLevel,
      'Start Date': user.startDate,
      City: user.city,
      Country: user.country,
      'Counselling Mode': user.counsellingMode,
      'Funding Source': user.fundingSource,
      Role: user.role,
      Status: user.status,
      'Analysis Count': user.analysisCount,
      'Max Analyses': user.maxAnalyses,
      'Created At': format(new Date(user.createdAt), "yyyy-MM-dd HH:mm:ss")
    }));

    const csvHeaders = Object.keys(csvData[0] || {});
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => csvHeaders.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users-export-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Success", description: `Exported ${csvData.length} users to CSV` });
  };

  // Export users data (legacy endpoint)
  const exportUsers = () => {
    window.open("/api/admin/export/users", "_blank");
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSave = () => {
    if (!selectedUser || !editingField) return;

    const numericValue = parseInt(editValue);
    
    switch (editingField) {
      case "maxAnalyses":
        if (!isNaN(numericValue) && numericValue >= 0) {
          updateMaxAnalysesMutation.mutate({ userId: selectedUser.id, maxAnalyses: numericValue });
        }
        break;
      case "role":
        updateRoleMutation.mutate({ userId: selectedUser.id, role: editValue });
        break;
      case "status":
        updateStatusMutation.mutate({ userId: selectedUser.id, status: editValue });
        break;
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const openUserDetails = (user: UserData) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "default";
      case "suspended": return "destructive";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === "admin" ? "destructive" : "secondary";
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
          </div>
          <Button onClick={exportUsersCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                <Input
                  id="search"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date" className="text-sm font-medium">Join Date</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Users</CardTitle>
              <User className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredUsers.length}</div>
              <p className="text-xs text-gray-600 mt-1">of {users.length} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredUsers.filter(u => u.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <User className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredUsers.filter(u => u.role === "admin").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredUsers.reduce((sum, user) => sum + user.analysisCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              A list of all users in the system with their details and analysis usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Study Info</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Analyses</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-600">@{user.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phoneNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            {user.studyDestination}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            {user.city}, {user.country}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{user.analysisCount} / {user.maxAnalyses}</div>
                          <div className="text-gray-600">used</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(user.createdAt), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUserDetails(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Complete information and analysis history for {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="analyses">Analyses ({userAnalyses.length})</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Full Name</Label>
                            <p className="text-sm text-gray-600">{selectedUser.firstName} {selectedUser.lastName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Username</Label>
                            <p className="text-sm text-gray-600">@{selectedUser.username}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p className="text-sm text-gray-600">{selectedUser.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Phone</Label>
                            <p className="text-sm text-gray-600">{selectedUser.phoneNumber}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Study Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Study Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Study Destination</Label>
                            <p className="text-sm text-gray-600">{selectedUser.studyDestination}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Study Level</Label>
                            <p className="text-sm text-gray-600">{selectedUser.studyLevel}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Start Date</Label>
                            <p className="text-sm text-gray-600">{selectedUser.startDate}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Counselling Mode</Label>
                            <p className="text-sm text-gray-600">{selectedUser.counsellingMode}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Funding Source</Label>
                            <p className="text-sm text-gray-600">{selectedUser.fundingSource}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Location</Label>
                            <p className="text-sm text-gray-600">{selectedUser.city}, {selectedUser.country}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Account Status */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Account Status</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Role</Label>
                            <div className="mt-1">
                              <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                                {selectedUser.role}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <div className="mt-1">
                              <Badge variant={getStatusBadgeVariant(selectedUser.status)}>
                                {selectedUser.status}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Member Since</Label>
                            <p className="text-sm text-gray-600">{format(new Date(selectedUser.createdAt), "PPP")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="analyses" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    {userAnalyses.length > 0 ? (
                      <div className="space-y-4">
                        {userAnalyses.map((analysis) => (
                          <Card key={analysis.id}>
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base">{analysis.fileName}</CardTitle>
                                  <CardDescription>
                                    Analyzed on {format(new Date(analysis.createdAt), "PPP")}
                                  </CardDescription>
                                </div>
                                <Badge variant={analysis.isPublic ? "default" : "secondary"}>
                                  {analysis.isPublic ? "Public" : "Private"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {analysis.analysisResults && (
                                <div className="space-y-2">
                                  {analysis.analysisResults.summary && (
                                    <div>
                                      <Label className="text-sm font-medium">Summary</Label>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {analysis.analysisResults.summary}
                                      </p>
                                    </div>
                                  )}
                                  {analysis.analysisResults.rejectionReasons?.length > 0 && (
                                    <div>
                                      <Label className="text-sm font-medium">Rejection Reasons</Label>
                                      <div className="mt-1 space-y-1">
                                        {analysis.analysisResults.rejectionReasons.slice(0, 2).map((reason: any, idx: number) => (
                                          <div key={idx} className="text-sm">
                                            <span className="font-medium">{reason.title}</span>
                                            <p className="text-gray-600 text-xs">{reason.description}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
                        <p className="text-gray-600">This user hasn't submitted any analyses yet.</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {/* Analysis Limit */}
                      <div>
                        <Label className="text-sm font-medium">Analysis Limit</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          {editingField === "maxAnalyses" ? (
                            <>
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-24"
                                min="0"
                              />
                              <Button size="sm" onClick={handleSave} disabled={updateMaxAnalysesMutation.isPending}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancel}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="text-sm text-gray-600">
                                {selectedUser.analysisCount} / {selectedUser.maxAnalyses} used
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit("maxAnalyses", selectedUser.maxAnalyses.toString())}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Role */}
                      <div>
                        <Label className="text-sm font-medium">Role</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          {editingField === "role" ? (
                            <>
                              <Select value={editValue} onValueChange={setEditValue}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button size="sm" onClick={handleSave} disabled={updateRoleMutation.isPending}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancel}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                                {selectedUser.role}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit("role", selectedUser.role)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Status */}
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          {editingField === "status" ? (
                            <>
                              <Select value={editValue} onValueChange={setEditValue}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="suspended">Suspended</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button size="sm" onClick={handleSave} disabled={updateStatusMutation.isPending}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancel}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Badge variant={getStatusBadgeVariant(selectedUser.status)}>
                                {selectedUser.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit("status", selectedUser.status)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}