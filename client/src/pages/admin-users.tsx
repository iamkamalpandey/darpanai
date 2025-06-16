import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Eye, Edit, Download, FileText, Calendar, Mail, Phone, MapPin, GraduationCap, Filter, Shield, Plus, UserMinus, UserX, Trash2 } from "lucide-react";
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

// Form schemas for user management
const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  role: z.enum(["user", "admin"]),
  status: z.enum(["active", "suspended", "inactive"]),
  maxAnalyses: z.number().min(0).default(3),
  userType: z.enum(["student", "agent", "other"]).optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  // Student fields (conditional)
  studyDestination: z.string().optional(),
  startDate: z.string().optional(),
  studyLevel: z.string().optional(),
  counsellingMode: z.string().optional(),
  fundingSource: z.string().optional(),
  // Agent fields (conditional)
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessLicense: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  specialization: z.string().optional(),
  // Other visa category fields (conditional)
  visaCategory: z.string().optional(),
  purposeOfTravel: z.string().optional(),
  // Common fields
  agreeToTerms: z.boolean().default(true),
  allowContact: z.boolean().default(true),
  receiveUpdates: z.boolean().default(true),
});

const editUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().optional(),
});

type CreateUserData = z.infer<typeof createUserSchema>;
type EditUserData = z.infer<typeof editUserSchema>;

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Forms for user management
  const createForm = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      role: "user",
      status: "active",
      maxAnalyses: 3,
      userType: "student",
      city: "",
      country: "",
      // Student fields
      studyDestination: "",
      startDate: "",
      studyLevel: "bachelor",
      counsellingMode: "online",
      fundingSource: "self",
      // Agent fields
      businessName: "",
      businessAddress: "",
      businessLicense: "",
      yearsOfExperience: "",
      specialization: "",
      // Other fields
      visaCategory: "",
      purposeOfTravel: "",
      // Common fields
      agreeToTerms: true,
      allowContact: true,
      receiveUpdates: true,
    },
  });

  const editForm = useForm<EditUserData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      role: "user",
      status: "active",
      maxAnalyses: 3,
      studyDestination: "",
      city: "",
      country: "",
      studyLevel: "bachelor",
      counsellingMode: "online",
      fundingSource: "self",
    },
  });

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<UserData[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch user analyses when user is selected (admin access to all analyses)
  const { data: userAnalyses = [] } = useQuery<AnalysisData[]>({
    queryKey: ["/api/admin/users", selectedUser?.id, "analyses"],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      try {
        const response = await fetch(`/api/admin/users/${selectedUser.id}`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        const userData = await response.json();
        return userData.analyses || [];
      } catch (error) {
        console.error("Fetch user analyses error:", error);
        throw error;
      }
    },
    enabled: !!selectedUser?.id,
  });

  // Update user max analyses mutation
  const updateMaxAnalysesMutation = useMutation({
    mutationFn: (data: { userId: number; maxAnalyses: number }) =>
      apiRequest("PATCH", `/api/admin/users/${data.userId}/max-analyses`, { maxAnalyses: data.maxAnalyses }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "Analysis limit updated successfully" });
      setEditingField(null);
    },
    onError: (error: any) => {
      console.error("Update max analyses error:", error);
      toast({ title: "Error", description: error?.message || "Failed to update analysis limit", variant: "destructive" });
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: (data: { userId: number; role: string }) =>
      apiRequest("PATCH", `/api/admin/users/${data.userId}/role`, { role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User role updated successfully" });
      setEditingField(null);
    },
    onError: (error: any) => {
      console.error("Update role error:", error);
      toast({ title: "Error", description: error?.message || "Failed to update user role", variant: "destructive" });
    },
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { userId: number; status: string }) =>
      apiRequest("PATCH", `/api/admin/users/${data.userId}/status`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User status updated successfully" });
      setEditingField(null);
    },
    onError: (error: any) => {
      console.error("Update status error:", error);
      toast({ title: "Error", description: error?.message || "Failed to update user status", variant: "destructive" });
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserData) =>
      apiRequest("POST", "/api/admin/users", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User created successfully" });
      setCreateUserOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      console.error("Create user error:", error);
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to create user", 
        variant: "destructive" 
      });
    },
  });

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: (data: { userId: number; updates: EditUserData }) =>
      apiRequest("PATCH", `/api/admin/users/${data.userId}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User updated successfully" });
      setEditUserOpen(false);
      setSelectedUser(null);
      editForm.reset();
    },
    onError: (error: any) => {
      console.error("Edit user error:", error);
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to update user", 
        variant: "destructive" 
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) =>
      apiRequest("DELETE", `/api/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User deleted successfully" });
      setSelectedUser(null);
      setUserDetailsOpen(false);
    },
    onError: (error: any) => {
      console.error("Delete user error:", error);
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to delete user", 
        variant: "destructive" 
      });
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
    try {
      setSelectedUser(user);
      setUserDetailsOpen(true);
      // Reset edit form with user data to prevent controlled/uncontrolled input errors
      editForm.reset({
        username: user.username || "",
        email: user.email || "",
        password: "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        role: (user.role === "admin" ? "admin" : "user"),
        status: (user.status === "suspended" || user.status === "inactive" ? user.status : "active"),
        maxAnalyses: user.maxAnalyses || 3,
        studyDestination: user.studyDestination || "",
        city: user.city || "",
        country: user.country || "",
        studyLevel: user.studyLevel || "bachelor",
        counsellingMode: user.counsellingMode || "online",
        fundingSource: user.fundingSource || "self",
      });
    } catch (error) {
      console.error("Error opening user details:", error);
      toast({
        title: "Error",
        description: "Failed to open user details",
        variant: "destructive",
      });
    }
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
          <div className="flex gap-2">
            <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
            </Dialog>
            <Button onClick={exportUsersCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
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
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openUserDetails(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              editForm.reset({
                                username: user.username,
                                email: user.email,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                phoneNumber: user.phoneNumber,
                                role: user.role as "user" | "admin",
                                status: user.status as "active" | "suspended" | "inactive",
                                maxAnalyses: user.maxAnalyses,
                                studyDestination: user.studyDestination,
                                city: user.city,
                                country: user.country,
                                studyLevel: user.studyLevel,
                                counsellingMode: user.counsellingMode,
                                fundingSource: user.fundingSource,
                              });
                              setEditUserOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ 
                              userId: user.id, 
                              status: user.status === "suspended" ? "active" : "suspended" 
                            })}
                            disabled={updateStatusMutation.isPending}
                          >
                            {user.status === "suspended" ? (
                              <User className="h-4 w-4 text-green-600" />
                            ) : (
                              <UserMinus className="h-4 w-4 text-orange-600" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete {user.firstName} {user.lastName} and all their data. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUserMutation.mutate(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user account to the system with their profile information
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="maxAnalyses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Analyses</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={createForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* User Type field only for regular users */}
                  {createForm.watch('role') === 'user' && (
                    <FormField
                      control={createForm.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select user type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="student">Student (Study Abroad)</SelectItem>
                              <SelectItem value="agent">Education Agent/Consultant</SelectItem>
                              <SelectItem value="other">Other Visa Category</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={createForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Nepal">Nepal</SelectItem>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                            <SelectItem value="Vietnam">Vietnam</SelectItem>
                            <SelectItem value="China">China</SelectItem>
                            <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                            <SelectItem value="Pakistan">Pakistan</SelectItem>
                            <SelectItem value="Philippines">Philippines</SelectItem>
                            <SelectItem value="Thailand">Thailand</SelectItem>
                            <SelectItem value="Indonesia">Indonesia</SelectItem>
                            <SelectItem value="Malaysia">Malaysia</SelectItem>
                            <SelectItem value="South Korea">South Korea</SelectItem>
                            <SelectItem value="Japan">Japan</SelectItem>
                            <SelectItem value="Myanmar">Myanmar</SelectItem>
                            <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                            <SelectItem value="Iran">Iran</SelectItem>
                            <SelectItem value="Turkey">Turkey</SelectItem>
                            <SelectItem value="Nigeria">Nigeria</SelectItem>
                            <SelectItem value="Kenya">Kenya</SelectItem>
                            <SelectItem value="Ghana">Ghana</SelectItem>
                            <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                            <SelectItem value="Egypt">Egypt</SelectItem>
                            <SelectItem value="Morocco">Morocco</SelectItem>
                            <SelectItem value="Brazil">Brazil</SelectItem>
                            <SelectItem value="Colombia">Colombia</SelectItem>
                            <SelectItem value="Mexico">Mexico</SelectItem>
                            <SelectItem value="Peru">Peru</SelectItem>
                            <SelectItem value="Ecuador">Ecuador</SelectItem>
                            <SelectItem value="Chile">Chile</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Conditional sections based on user type - only for regular users */}
                <>
                {createForm.watch('role') === 'user' && createForm.watch('userType') === 'student' && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold">Student Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="studyDestination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Study Destination</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select destination" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Australia">Australia</SelectItem>
                                <SelectItem value="United States">United States</SelectItem>
                                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="Germany">Germany</SelectItem>
                                <SelectItem value="New Zealand">New Zealand</SelectItem>
                                <SelectItem value="France">France</SelectItem>
                                <SelectItem value="Netherlands">Netherlands</SelectItem>
                                <SelectItem value="Sweden">Sweden</SelectItem>
                                <SelectItem value="Norway">Norway</SelectItem>
                                <SelectItem value="Denmark">Denmark</SelectItem>
                                <SelectItem value="Finland">Finland</SelectItem>
                                <SelectItem value="Switzerland">Switzerland</SelectItem>
                                <SelectItem value="Austria">Austria</SelectItem>
                                <SelectItem value="Ireland">Ireland</SelectItem>
                                <SelectItem value="Belgium">Belgium</SelectItem>
                                <SelectItem value="Italy">Italy</SelectItem>
                                <SelectItem value="Spain">Spain</SelectItem>
                                <SelectItem value="Portugal">Portugal</SelectItem>
                                <SelectItem value="Poland">Poland</SelectItem>
                                <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                                <SelectItem value="Hungary">Hungary</SelectItem>
                                <SelectItem value="Singapore">Singapore</SelectItem>
                                <SelectItem value="South Korea">South Korea</SelectItem>
                                <SelectItem value="Japan">Japan</SelectItem>
                                <SelectItem value="Hong Kong">Hong Kong</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="e.g., Fall 2025" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="studyLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Study Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select study level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bachelor">Bachelor's</SelectItem>
                                <SelectItem value="master">Master's</SelectItem>
                                <SelectItem value="phd">PhD</SelectItem>
                                <SelectItem value="diploma">Diploma</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="counsellingMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Counselling Mode</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="in-person">In-Person</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={createForm.control}
                      name="fundingSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Funding Source</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select funding" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="self">Self-funded</SelectItem>
                              <SelectItem value="scholarship">Scholarship</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="loan">Student Loan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                )}

                {/* Agent Business Information */}
                {createForm.watch('role') === 'user' && createForm.watch('userType') === 'agent' && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold">Business Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="Your business name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="yearsOfExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select experience" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0-1">0-1 years</SelectItem>
                                <SelectItem value="2-5">2-5 years</SelectItem>
                                <SelectItem value="6-10">6-10 years</SelectItem>
                                <SelectItem value="10+">10+ years</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={createForm.control}
                      name="businessAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Address</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="Complete business address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="businessLicense"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business License (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="License number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialization</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select specialization" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="student-visa">Student Visa</SelectItem>
                                <SelectItem value="work-visa">Work Visa</SelectItem>
                                <SelectItem value="immigration">Immigration</SelectItem>
                                <SelectItem value="business-visa">Business Visa</SelectItem>
                                <SelectItem value="family-visa">Family Visa</SelectItem>
                                <SelectItem value="general">General Consultation</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Other Visa Category Information */}
                {createForm.watch('userType') === 'other' && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold">Visa Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="visaCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Visa Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select visa category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="tourist">Tourist/Visitor Visa</SelectItem>
                                <SelectItem value="business">Business Visa</SelectItem>
                                <SelectItem value="work">Work Visa</SelectItem>
                                <SelectItem value="family">Family Visa</SelectItem>
                                <SelectItem value="transit">Transit Visa</SelectItem>
                                <SelectItem value="medical">Medical Visa</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="purposeOfTravel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purpose of Travel</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="Brief description of travel purpose" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                </>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and settings
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit((data) => {
                if (selectedUser) {
                  editUserMutation.mutate({ userId: selectedUser.id, updates: data });
                }
              })} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password (optional)</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} value={field.value || ""} placeholder="Leave blank to keep current password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="maxAnalyses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Analyses</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editUserMutation.isPending}>
                    {editUserMutation.isPending ? "Updating..." : "Update User"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

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
                  {/* Admin Access Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Administrator Access</p>
                        <p className="text-blue-700">You have access to all user analyses regardless of privacy settings for administrative purposes.</p>
                      </div>
                    </div>
                  </div>
                  
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