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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Clock, User, Mail, Phone, MapPin, Edit, Download, CheckCircle, XCircle, AlertCircle, Eye, Filter } from "lucide-react";
import { format, isAfter, parseISO, subDays, subMonths, subYears } from "date-fns";

interface AppointmentData {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  preferredDate: string;
  preferredTime: string;
  consultationType: string;
  message: string;
  status: string;
  createdAt: string;
  user?: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    city: string;
    country: string;
  } | null;
}

export default function AdminAppointments() {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all appointments with user data
  const { data: appointments = [], isLoading } = useQuery<AppointmentData[]>({
    queryKey: ["/api/admin/appointments"],
  });

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { appointmentId: number; status: string }) =>
      apiRequest(`/api/admin/appointments/${data.appointmentId}/status`, "PATCH", { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointments"] });
      toast({ title: "Success", description: "Appointment status updated successfully" });
      setEditingField(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update appointment status", variant: "destructive" });
    },
  });

  // Filter appointments based on all criteria
  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    
    const matchesSearch = searchTerm === "" ||
      appointment.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.consultationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filter
    const appointmentDate = parseISO(appointment.createdAt);
    const now = new Date();
    let matchesDate = true;

    switch (dateFilter) {
      case "today":
        matchesDate = format(appointmentDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
        break;
      case "week":
        matchesDate = isAfter(appointmentDate, subDays(now, 7));
        break;
      case "month":
        matchesDate = isAfter(appointmentDate, subMonths(now, 1));
        break;
      case "year":
        matchesDate = isAfter(appointmentDate, subYears(now, 1));
        break;
      case "all":
      default:
        matchesDate = true;
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  // CSV export functionality
  const exportAppointmentsCSV = () => {
    const csvData = filteredAppointments.map(appointment => ({
      ID: appointment.id,
      'Client Name': appointment.fullName,
      Email: appointment.email,
      'Phone Number': appointment.phoneNumber,
      'Preferred Date': format(new Date(appointment.preferredDate), "yyyy-MM-dd"),
      'Preferred Time': appointment.preferredTime,
      'Consultation Type': appointment.consultationType,
      Message: appointment.message || 'N/A',
      Status: appointment.status,
      'User ID': appointment.userId,
      'Username': appointment.user?.username || 'N/A',
      'User Name': appointment.user ? `${appointment.user.firstName} ${appointment.user.lastName}` : 'N/A',
      'User Email': appointment.user?.email || 'N/A',
      'User Location': appointment.user ? `${appointment.user.city}, ${appointment.user.country}` : 'N/A',
      'Booked At': format(new Date(appointment.createdAt), "yyyy-MM-dd HH:mm:ss")
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
    link.setAttribute('download', `appointments-export-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Success", description: `Exported ${csvData.length} appointments to CSV` });
  };

  // Export appointments data (legacy endpoint)
  const exportAppointments = () => {
    window.open("/api/admin/export/appointments", "_blank");
  };

  const openAppointmentDetails = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setAppointmentDetailsOpen(true);
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSave = () => {
    if (!selectedAppointment || !editingField) return;

    if (editingField === "status") {
      updateStatusMutation.mutate({ appointmentId: selectedAppointment.id, status: editValue });
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed": return "default";
      case "pending": return "secondary";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed": return <CheckCircle className="h-3 w-3" />;
      case "pending": return <Clock className="h-3 w-3" />;
      case "completed": return <CheckCircle className="h-3 w-3" />;
      case "cancelled": return <XCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointments...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Appointment Management</h1>
            <p className="text-gray-600">Manage consultation bookings and user appointments</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={exportAppointmentsCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={exportAppointments} variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredAppointments.length}</div>
              <p className="text-xs text-gray-600 mt-1">of {appointments.length} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredAppointments.filter(a => a.status === "pending").length}
              </div>
              <p className="text-xs text-gray-600 mt-1">Awaiting confirmation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredAppointments.filter(a => a.status === "confirmed").length}
              </div>
              <p className="text-xs text-gray-600 mt-1">Ready to proceed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredAppointments.filter(a => a.status === "completed").length}
              </div>
              <p className="text-xs text-gray-600 mt-1">Finished sessions</p>
            </CardContent>
          </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by name, email, or consultation type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
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
              <div>
                <Label htmlFor="date" className="text-sm font-medium">Booking Date</Label>
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

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
            <CardDescription>
              Complete list of consultation appointments with client details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Preferred Date</TableHead>
                    <TableHead>Consultation Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.fullName}</div>
                          {appointment.user && (
                            <div className="text-sm text-gray-600">
                              @{appointment.user.username}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {appointment.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {appointment.phoneNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(appointment.preferredDate), "MMM dd, yyyy")}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {appointment.preferredTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {appointment.consultationType}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{appointment.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(appointment.createdAt), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAppointmentDetails(appointment)}
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

        {/* Appointment Details Dialog */}
        <Dialog open={appointmentDetailsOpen} onOpenChange={setAppointmentDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                Complete consultation appointment information for {selectedAppointment?.fullName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedAppointment && (
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="client">Client Info</TabsTrigger>
                  <TabsTrigger value="management">Management</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {/* Appointment Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Appointment Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Client Name</Label>
                            <p className="text-sm text-gray-600">{selectedAppointment.fullName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Consultation Type</Label>
                            <p className="text-sm text-gray-600">{selectedAppointment.consultationType}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Preferred Date</Label>
                            <p className="text-sm text-gray-600">
                              {format(new Date(selectedAppointment.preferredDate), "PPP")}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Preferred Time</Label>
                            <p className="text-sm text-gray-600">{selectedAppointment.preferredTime}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <div className="mt-1">
                              <Badge variant={getStatusBadgeVariant(selectedAppointment.status)}>
                                {getStatusIcon(selectedAppointment.status)}
                                <span className="ml-1">{selectedAppointment.status}</span>
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Booking Date</Label>
                            <p className="text-sm text-gray-600">
                              {format(new Date(selectedAppointment.createdAt), "PPP")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Message */}
                      {selectedAppointment.message && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Message</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">{selectedAppointment.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="client" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {/* Contact Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p className="text-sm text-gray-600">{selectedAppointment.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Phone Number</Label>
                            <p className="text-sm text-gray-600">{selectedAppointment.phoneNumber}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* User Account Information */}
                      {selectedAppointment.user && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">User Account</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Username</Label>
                              <p className="text-sm text-gray-600">@{selectedAppointment.user.username}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Full Name</Label>
                              <p className="text-sm text-gray-600">
                                {selectedAppointment.user.firstName} {selectedAppointment.user.lastName}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Account Email</Label>
                              <p className="text-sm text-gray-600">{selectedAppointment.user.email}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Location</Label>
                              <p className="text-sm text-gray-600">
                                {selectedAppointment.user.city}, {selectedAppointment.user.country}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="management" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {/* Status Management */}
                      <div>
                        <Label className="text-sm font-medium">Appointment Status</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          {editingField === "status" ? (
                            <>
                              <Select value={editValue} onValueChange={setEditValue}>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                              <Badge variant={getStatusBadgeVariant(selectedAppointment.status)}>
                                {getStatusIcon(selectedAppointment.status)}
                                <span className="ml-1">{selectedAppointment.status}</span>
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit("status", selectedAppointment.status)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit Status
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Actions */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (selectedAppointment.status !== "confirmed") {
                                  updateStatusMutation.mutate({ 
                                    appointmentId: selectedAppointment.id, 
                                    status: "confirmed" 
                                  });
                                }
                              }}
                              disabled={selectedAppointment.status === "confirmed"}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirm Appointment
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (selectedAppointment.status !== "completed") {
                                  updateStatusMutation.mutate({ 
                                    appointmentId: selectedAppointment.id, 
                                    status: "completed" 
                                  });
                                }
                              }}
                              disabled={selectedAppointment.status === "completed"}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Complete
                            </Button>
                          </div>
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