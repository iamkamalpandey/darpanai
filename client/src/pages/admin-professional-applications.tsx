import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building2, Eye, CheckCircle, XCircle, Clock, Filter, Download } from "lucide-react";

interface ProfessionalApplication {
  id: number;
  planType: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  teamSize: string;
  monthlyVolume: string;
  useCase: string;
  additionalInfo?: string;
  status: string;
  adminNotes?: string;
  reviewedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProfessionalApplications() {
  const [selectedApplication, setSelectedApplication] = useState<ProfessionalApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all professional applications
  const { data: applications = [], isLoading } = useQuery<ProfessionalApplication[]>({
    queryKey: ["/api/admin/professional-applications"],
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: number; status: string; adminNotes?: string }) =>
      apiRequest(`/api/admin/professional-applications/${data.id}/status`, "PATCH", {
        status: data.status,
        adminNotes: data.adminNotes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professional-applications"] });
      toast({ title: "Success", description: "Application status updated successfully" });
      setDetailsOpen(false);
      setSelectedApplication(null);
      setAdminNotes("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update application status", variant: "destructive" });
    },
  });

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesPlan = planFilter === "all" || app.planType === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "default";
      case "rejected": return "destructive";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  // Get plan badge variant
  const getPlanBadgeVariant = (planType: string) => {
    return planType === "enterprise" ? "destructive" : "default";
  };

  // Handle application review
  const handleReview = (application: ProfessionalApplication) => {
    setSelectedApplication(application);
    setAdminNotes(application.adminNotes || "");
    setDetailsOpen(true);
  };

  // Handle status update
  const handleStatusUpdate = (status: string) => {
    if (selectedApplication) {
      updateStatusMutation.mutate({
        id: selectedApplication.id,
        status,
        adminNotes,
      });
    }
  };

  // Export applications to CSV
  const exportApplicationsCSV = () => {
    const csvData = filteredApplications.map(app => ({
      ID: app.id,
      'Plan Type': app.planType,
      'Company Name': app.companyName,
      'Contact Name': app.contactName,
      Email: app.email,
      Phone: app.phone,
      Industry: app.industry,
      'Team Size': app.teamSize,
      'Monthly Volume': app.monthlyVolume,
      'Use Case': app.useCase,
      Status: app.status,
      'Admin Notes': app.adminNotes || '',
      'Created At': format(new Date(app.createdAt), "yyyy-MM-dd HH:mm:ss")
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
    link.setAttribute('download', `professional-applications-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Success", description: `Exported ${csvData.length} applications to CSV` });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Professional Applications</h1>
            <p className="text-gray-600">Review and manage professional account applications</p>
          </div>
          <Button onClick={exportApplicationsCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.filter(app => app.status === 'pending').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.filter(app => app.status === 'approved').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.filter(app => app.status === 'rejected').length}</div>
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
                  placeholder="Search applications..."
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
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="plan" className="text-sm font-medium">Plan Type</Label>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.companyName}</div>
                        <div className="text-sm text-gray-500">{application.industry}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.contactName}</div>
                        <div className="text-sm text-gray-500">{application.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPlanBadgeVariant(application.planType)}>
                        {application.planType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(application.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(application)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Application Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Application</DialogTitle>
              <DialogDescription>
                Review and manage professional account application
              </DialogDescription>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Company Name</Label>
                    <p className="text-sm">{selectedApplication.companyName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Contact Name</Label>
                    <p className="text-sm">{selectedApplication.contactName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Industry</Label>
                    <p className="text-sm">{selectedApplication.industry}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Team Size</Label>
                    <p className="text-sm">{selectedApplication.teamSize}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Monthly Volume</Label>
                    <p className="text-sm">{selectedApplication.monthlyVolume}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Plan Type</Label>
                    <Badge variant={getPlanBadgeVariant(selectedApplication.planType)}>
                      {selectedApplication.planType}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Use Case</Label>
                  <p className="text-sm">{selectedApplication.useCase}</p>
                </div>
                
                {selectedApplication.additionalInfo && (
                  <div>
                    <Label className="text-sm font-medium">Additional Information</Label>
                    <p className="text-sm">{selectedApplication.additionalInfo}</p>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="adminNotes" className="text-sm font-medium">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setDetailsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate("rejected")}
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleStatusUpdate("approved")}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}