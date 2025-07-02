import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  FileText, 
  Eye, 
  Send, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Search,
  Filter,
  UserCheck,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  MapPin,
  DollarSign
} from "lucide-react";

interface Application {
  id: number;
  userId: number;
  applicationNumber: string;
  studyLevel: string;
  fieldOfStudy: string;
  targetCountry: string;
  preferredIntake: string;
  budgetRange: string;
  fundingSource: string;
  status: 'draft' | 'submitted' | 'under_review' | 'documents_requested' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  submittedAt?: string;
  lastUpdated: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
  };
  documents: Array<{
    type: string;
    name: string;
    uploadedAt: string;
    verified: boolean;
  }>;
  notes: Array<{
    id: number;
    message: string;
    createdAt: string;
    createdBy: string;
    type: 'internal' | 'student_visible';
  }>;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800",
  documents_requested: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800"
};

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};

export default function AdminApplicationManagement() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<'internal' | 'student_visible'>('internal');
  const [documentRequest, setDocumentRequest] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch applications
  const { data: responseData, isLoading } = useQuery({
    queryKey: ["/api/admin/applications"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/applications");
      return response.json();
    }
  });

  const applications = responseData?.applications || [];

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (data: { applicationId: number; message: string; type: 'internal' | 'student_visible' }) => {
      const response = await apiRequest("POST", `/api/admin/applications/${data.applicationId}/notes`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      setNewNote("");
      toast({ title: "Note added successfully" });
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { applicationId: number; status: string; message?: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/applications/${data.applicationId}/status`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({ title: "Application status updated" });
    }
  });

  // Request documents mutation
  const requestDocumentsMutation = useMutation({
    mutationFn: async (data: { applicationId: number; documents: string; message: string }) => {
      const response = await apiRequest("POST", `/api/admin/applications/${data.applicationId}/request-documents`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      setDocumentRequest("");
      toast({ title: "Document request sent to student" });
    }
  });

  // Filter applications
  const filteredApplications = applications.filter((app: Application) => {
    const matchesSearch = 
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${app.personalDetails.firstName} ${app.personalDetails.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.personalDetails.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || app.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate statistics
  const stats = {
    total: applications.length,
    submitted: applications.filter((app: Application) => app.status === 'submitted').length,
    underReview: applications.filter((app: Application) => app.status === 'under_review').length,
    approved: applications.filter((app: Application) => app.status === 'approved').length,
    highPriority: applications.filter((app: Application) => app.priority === 'high').length
  };

  const handleAddNote = () => {
    if (!selectedApplication || !newNote.trim()) return;
    
    addNoteMutation.mutate({
      applicationId: selectedApplication.id,
      message: newNote,
      type: noteType
    });
  };

  const handleStatusUpdate = (status: string, message?: string) => {
    if (!selectedApplication) return;
    
    updateStatusMutation.mutate({
      applicationId: selectedApplication.id,
      status,
      message
    });
  };

  const handleRequestDocuments = () => {
    if (!selectedApplication || !documentRequest.trim()) return;
    
    requestDocumentsMutation.mutate({
      applicationId: selectedApplication.id,
      documents: documentRequest,
      message: `Additional documents required: ${documentRequest}`
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-600">Manage student applications and document requests</p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-xl font-bold">{stats.submitted}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-xl font-bold">{stats.underReview}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-xl font-bold">{stats.highPriority}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by application number, student name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="documents_requested">Documents Requested</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Applications ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Application</th>
                  <th className="text-left p-4 font-medium">Student</th>
                  <th className="text-left p-4 font-medium">Study Details</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Priority</th>
                  <th className="text-left p-4 font-medium">Submitted</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application: Application) => (
                  <tr key={application.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{application.applicationNumber}</p>
                        <p className="text-sm text-gray-600">ID: {application.id}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">
                          {application.personalDetails.firstName} {application.personalDetails.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{application.personalDetails.email}</p>
                        <p className="text-sm text-gray-600">{application.personalDetails.phoneNumber}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{application.studyLevel}</p>
                        <p className="text-sm text-gray-600">{application.fieldOfStudy}</p>
                        <p className="text-sm text-gray-600">{application.targetCountry}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${statusColors[application.status]} border-0`}>
                        {application.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`${priorityColors[application.priority]} border-0`}>
                        {application.priority.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">
                        {application.submittedAt 
                          ? new Date(application.submittedAt).toLocaleDateString()
                          : "Not submitted"
                        }
                      </p>
                    </td>
                    <td className="p-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Application Details - {selectedApplication?.applicationNumber}
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedApplication && (
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                <TabsTrigger value="notes">Notes</TabsTrigger>
                                <TabsTrigger value="actions">Actions</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="details" className="space-y-6">
                                {/* Personal Information */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <UserCheck className="h-5 w-5" />
                                      Personal Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                                      <p className="text-sm">
                                        {selectedApplication.personalDetails.firstName} {selectedApplication.personalDetails.lastName}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Email</label>
                                      <p className="text-sm flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        {selectedApplication.personalDetails.email}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Phone</label>
                                      <p className="text-sm flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {selectedApplication.personalDetails.phoneNumber}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                                      <p className="text-sm flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {selectedApplication.personalDetails.dateOfBirth}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Nationality</label>
                                      <p className="text-sm">{selectedApplication.personalDetails.nationality}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Passport Number</label>
                                      <p className="text-sm">{selectedApplication.personalDetails.passportNumber}</p>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Study Information */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <GraduationCap className="h-5 w-5" />
                                      Study Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Study Level</label>
                                      <p className="text-sm">{selectedApplication.studyLevel}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Field of Study</label>
                                      <p className="text-sm">{selectedApplication.fieldOfStudy}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Target Country</label>
                                      <p className="text-sm flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {selectedApplication.targetCountry}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Preferred Intake</label>
                                      <p className="text-sm">{selectedApplication.preferredIntake}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Budget Range</label>
                                      <p className="text-sm flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        {selectedApplication.budgetRange}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Funding Source</label>
                                      <p className="text-sm">{selectedApplication.fundingSource}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                              
                              <TabsContent value="documents" className="space-y-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Uploaded Documents</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {selectedApplication.documents.length > 0 ? (
                                      <div className="space-y-3">
                                        {selectedApplication.documents.map((doc, index) => (
                                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                              <FileText className="h-5 w-5 text-gray-500" />
                                              <div>
                                                <p className="font-medium">{doc.name}</p>
                                                <p className="text-sm text-gray-600">
                                                  {doc.type} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {doc.verified ? (
                                                <Badge className="bg-green-100 text-green-800 border-0">
                                                  Verified
                                                </Badge>
                                              ) : (
                                                <Badge className="bg-yellow-100 text-yellow-800 border-0">
                                                  Pending
                                                </Badge>
                                              )}
                                              <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-gray-600 text-center py-8">No documents uploaded</p>
                                    )}
                                  </CardContent>
                                </Card>
                              </TabsContent>
                              
                              <TabsContent value="notes" className="space-y-4">
                                {/* Add New Note */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Add Note</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div>
                                      <Select value={noteType} onValueChange={(value: 'internal' | 'student_visible') => setNoteType(value)}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="internal">Internal Note (Admin Only)</SelectItem>
                                          <SelectItem value="student_visible">Student Visible Note</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Textarea
                                      placeholder="Enter your note..."
                                      value={newNote}
                                      onChange={(e) => setNewNote(e.target.value)}
                                      rows={3}
                                    />
                                    <Button 
                                      onClick={handleAddNote}
                                      disabled={!newNote.trim() || addNoteMutation.isPending}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Add Note
                                    </Button>
                                  </CardContent>
                                </Card>

                                {/* Existing Notes */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Notes History</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {selectedApplication.notes.length > 0 ? (
                                      <div className="space-y-3">
                                        {selectedApplication.notes.map((note) => (
                                          <div key={note.id} className="p-3 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                              <Badge 
                                                className={note.type === 'internal' 
                                                  ? "bg-gray-100 text-gray-800 border-0" 
                                                  : "bg-blue-100 text-blue-800 border-0"
                                                }
                                              >
                                                {note.type === 'internal' ? 'Internal' : 'Student Visible'}
                                              </Badge>
                                              <p className="text-sm text-gray-600">
                                                {note.createdBy} • {new Date(note.createdAt).toLocaleString()}
                                              </p>
                                            </div>
                                            <p className="text-sm">{note.message}</p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-gray-600 text-center py-8">No notes available</p>
                                    )}
                                  </CardContent>
                                </Card>
                              </TabsContent>
                              
                              <TabsContent value="actions" className="space-y-4">
                                {/* Status Update */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Update Status</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-3">
                                      <Button 
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('under_review')}
                                        disabled={updateStatusMutation.isPending}
                                      >
                                        <Clock className="h-4 w-4 mr-2" />
                                        Under Review
                                      </Button>
                                      <Button 
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('approved')}
                                        disabled={updateStatusMutation.isPending}
                                        className="text-green-600 hover:text-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </Button>
                                      <Button 
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('documents_requested')}
                                        disabled={updateStatusMutation.isPending}
                                        className="text-orange-600 hover:text-orange-700"
                                      >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Request Documents
                                      </Button>
                                      <Button 
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('rejected')}
                                        disabled={updateStatusMutation.isPending}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Request Additional Documents */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Request Additional Documents</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <Textarea
                                      placeholder="Specify the documents you need from the student..."
                                      value={documentRequest}
                                      onChange={(e) => setDocumentRequest(e.target.value)}
                                      rows={3}
                                    />
                                    <Button 
                                      onClick={handleRequestDocuments}
                                      disabled={!documentRequest.trim() || requestDocumentsMutation.isPending}
                                    >
                                      <Send className="h-4 w-4 mr-2" />
                                      Send Document Request
                                    </Button>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No applications found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}