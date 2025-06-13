import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Search, Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  preferredDate: string;
  message: string;
  status: string;
  createdAt: string;
  user: {
    username: string;
    fullName: string;
    email: string;
    analysisCount: number;
    maxAnalyses: number;
  };
}

export default function AdminAppointments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/admin/appointments"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/appointments/${appointmentId}/status`, {
        status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointments"] });
      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleStatusUpdate = (appointmentId: number, status: string) => {
    updateStatusMutation.mutate({ appointmentId, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'confirmed':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading appointments...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appointment Management</h1>
            <p className="text-muted-foreground">Manage consultation bookings and user appointments</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppointments}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAppointments}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedAppointments}</div>
              <p className="text-xs text-muted-foreground">Ready to proceed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAppointments}</div>
              <p className="text-xs text-muted-foreground">Finished sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Preferred Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{appointment.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          @{appointment.user.username} • {appointment.user.analysisCount}/{appointment.user.maxAnalyses} analyses
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{appointment.email}</div>
                        <div className="text-muted-foreground">{appointment.phoneNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(appointment.preferredDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(appointment.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {appointment.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Appointment Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-3">Client Information</h3>
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {selectedAppointment.fullName}</p>
                      <p><strong>Email:</strong> {selectedAppointment.email}</p>
                      <p><strong>Phone:</strong> {selectedAppointment.phoneNumber}</p>
                      <p><strong>Username:</strong> @{selectedAppointment.user.username}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Appointment Details</h3>
                    <div className="space-y-2">
                      <p><strong>Preferred Date:</strong> {format(new Date(selectedAppointment.preferredDate), 'PPP')}</p>
                      <p><strong>Status:</strong> {getStatusBadge(selectedAppointment.status)}</p>
                      <p><strong>Booked:</strong> {format(new Date(selectedAppointment.createdAt), 'PPpp')}</p>
                      <p><strong>User Analyses:</strong> {selectedAppointment.user.analysisCount}/{selectedAppointment.user.maxAnalyses}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Message</h3>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{selectedAppointment.message}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  {selectedAppointment.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => {
                          handleStatusUpdate(selectedAppointment.id, 'confirmed');
                          setIsDetailsOpen(false);
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        Confirm Appointment
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleStatusUpdate(selectedAppointment.id, 'cancelled');
                          setIsDetailsOpen(false);
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        Cancel Appointment
                      </Button>
                    </>
                  )}
                  {selectedAppointment.status === 'confirmed' && (
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment.id, 'completed');
                        setIsDetailsOpen(false);
                      }}
                      disabled={updateStatusMutation.isPending}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}