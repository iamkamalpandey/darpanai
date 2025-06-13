import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

interface UserData {
  id: number;
  username: string;
  email: string;
  fullName: string;
  qualification: string;
  graduationYear: string;
  phoneNumber: string;
  role: string;
  analysisCount: number;
  maxAnalyses: number;
  createdAt: string;
}

interface UserDetails extends UserData {
  analyses: any[];
  appointments: any[];
}

export default function AdminPanel() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newMaxAnalyses, setNewMaxAnalyses] = useState<number>(0);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);

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

  const stats = users ? {
    totalUsers: users.length,
    totalAnalyses: users.reduce((sum, user) => sum + user.analysisCount, 0),
    adminUsers: users.filter(user => user.role === 'admin').length,
    activeUsers: users.filter(user => user.analysisCount > 0).length,
  } : null;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin panel...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage users, view analytics, and control system settings
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
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage all registered users, their usage, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Analyses Used</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
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
                ))}
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
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userDetails.analyses.map((analysis) => (
                            <TableRow key={analysis.id}>
                              <TableCell className="font-medium">{analysis.filename}</TableCell>
                              <TableCell>{new Date(analysis.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="max-w-xs truncate">{analysis.summary}</TableCell>
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
      </div>
    </DashboardLayout>
  );
}