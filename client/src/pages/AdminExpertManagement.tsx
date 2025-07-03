import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudyAbroadExpertSchema, insertStudentExpertAssignmentSchema } from "@shared/schema";
import { z } from "zod";
import { Plus, Users, UserCheck, Star, Clock, MapPin, Award, BookOpen } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type Expert = {
  id: number;
  userId: number;
  expertType: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  specializations?: string[];
  expertiseAreas?: string[];
  languages?: string[];
  yearsOfExperience: number;
  bio?: string;
  isAvailable: boolean;
  currentStudentCount: number;
  maxStudentsAllowed: number;
  totalStudentsHelped: number;
  successRate: string;
  averageRating: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  username?: string;
};

type Student = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  studyLevel?: string;
  fieldOfStudy?: string;
  preferredCountries?: string[];
  createdAt: string;
};

type Assignment = {
  id: number;
  studentId: number;
  expertId: number;
  assignmentType: string;
  priority: string;
  status: string;
  assignedAt: string;
  studentName: string;
  studentEmail: string;
  expertName: string;
  expertType: string;
};

export default function AdminExpertManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("experts");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: experts = [], isLoading: expertsLoading } = useQuery({
    queryKey: ["/api/expert/experts"]
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/expert/students"]
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/expert/assignments"]
  });

  // Forms
  const expertForm = useForm({
    resolver: zodResolver(insertStudyAbroadExpertSchema),
    defaultValues: {
      expertType: "counselor",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      specializations: [],
      expertiseAreas: [],
      languages: ["English"],
      yearsOfExperience: 0,
      bio: "",
      isAvailable: true,
      maxStudentsAllowed: 20,
      status: "active"
    }
  });

  const assignmentForm = useForm({
    resolver: zodResolver(insertStudentExpertAssignmentSchema),
    defaultValues: {
      studentId: 0,
      expertId: 0,
      assignmentType: "primary",
      priority: "normal",
      assignmentReason: ""
    }
  });

  // Mutations
  const createExpertMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/expert/experts", data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Expert Created Successfully",
        description: (data as any)?.message || "Expert has been created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expert/experts"] });
      setIsCreateDialogOpen(false);
      expertForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Expert",
        description: error.message || "Failed to create expert",
        variant: "destructive"
      });
    }
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/expert/assignments", data);
    },
    onSuccess: () => {
      toast({
        title: "Assignment Created",
        description: "Expert has been assigned to student successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expert/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expert/experts"] });
      setIsAssignDialogOpen(false);
      assignmentForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Assignment",
        description: error.message || "Failed to create assignment",
        variant: "destructive"
      });
    }
  });

  const getExpertTypeColor = (type: string) => {
    switch (type) {
      case "counselor": return "bg-blue-100 text-blue-800";
      case "documentation_expert": return "bg-green-100 text-green-800";
      case "visa_expert": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getExpertTypeName = (type: string) => {
    switch (type) {
      case "counselor": return "Study Counselor";
      case "documentation_expert": return "Documentation Expert";
      case "visa_expert": return "Visa Expert";
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "suspended": return "bg-red-100 text-red-800";
      case "on_leave": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Abroad Expert Management</h1>
            <p className="text-gray-600 mt-1">Manage educational counselors, documentation experts, and visa specialists</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Expert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Study Abroad Expert</DialogTitle>
                </DialogHeader>
                <Form {...expertForm}>
                  <form onSubmit={expertForm.handleSubmit((data) => createExpertMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={expertForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Dr. Sarah" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={expertForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Wilson" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={expertForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="sarah.wilson@studyabroad.com" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={expertForm.control}
                        name="expertType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expert Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select expert type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="counselor">Study Counselor</SelectItem>
                                <SelectItem value="documentation_expert">Documentation Expert</SelectItem>
                                <SelectItem value="visa_expert">Visa Expert</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={expertForm.control}
                        name="yearsOfExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={expertForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Brief description of expertise and background..." rows={3} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createExpertMutation.isPending}>
                        {createExpertMutation.isPending ? "Creating..." : "Create Expert"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Assign Expert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Expert to Student</DialogTitle>
                </DialogHeader>
                <Form {...assignmentForm}>
                  <form onSubmit={assignmentForm.handleSubmit((data) => createAssignmentMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={assignmentForm.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Student</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a student" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {students.map((student: Student) => (
                                <SelectItem key={student.id} value={student.id.toString()}>
                                  {student.firstName} {student.lastName} ({student.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={assignmentForm.control}
                      name="expertId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Expert</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose an expert" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {experts.filter((expert: Expert) => expert.isAvailable).map((expert: Expert) => (
                                <SelectItem key={expert.id} value={expert.id.toString()}>
                                  {expert.firstName} {expert.lastName} - {getExpertTypeName(expert.expertType)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={assignmentForm.control}
                        name="assignmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assignment Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="primary">Primary Counselor</SelectItem>
                                <SelectItem value="secondary">Secondary Support</SelectItem>
                                <SelectItem value="consultation">Consultation Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={assignmentForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={assignmentForm.control}
                      name="assignmentReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignment Reason</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Why is this expert being assigned?" rows={2} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createAssignmentMutation.isPending}>
                        {createAssignmentMutation.isPending ? "Assigning..." : "Assign Expert"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          {[
            { id: "experts", label: "Experts", icon: UserCheck },
            { id: "assignments", label: "Assignments", icon: Users },
            { id: "students", label: "Students", icon: BookOpen }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                selectedTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {selectedTab === "experts" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {expertsLoading ? (
              <div className="col-span-full text-center py-8">Loading experts...</div>
            ) : experts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No experts found. Create your first Study Abroad Expert.
              </div>
            ) : (
              experts.map((expert: Expert) => (
                <Card key={expert.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{expert.firstName} {expert.lastName}</CardTitle>
                        <p className="text-sm text-gray-600">{expert.email}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={getExpertTypeColor(expert.expertType)}>
                          {getExpertTypeName(expert.expertType)}
                        </Badge>
                        <Badge className={getStatusColor(expert.status)}>
                          {expert.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600">
                      {expert.bio && expert.bio.length > 100 
                        ? `${expert.bio.substring(0, 100)}...`
                        : expert.bio || "No bio available"}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {expert.yearsOfExperience} years
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        {expert.currentStudentCount}/{expert.maxStudentsAllowed}
                      </div>
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-1 text-gray-400" />
                        {expert.totalStudentsHelped} helped
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-gray-400" />
                        {expert.averageRating}/5.0
                      </div>
                    </div>

                    {expert.specializations && expert.specializations.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Specializations:</div>
                        <div className="flex flex-wrap gap-1">
                          {expert.specializations.slice(0, 3).map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {expert.specializations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{expert.specializations.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {selectedTab === "assignments" && (
          <Card>
            <CardHeader>
              <CardTitle>Current Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <div className="text-center py-8">Loading assignments...</div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No assignments found. Start by assigning experts to students.
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment: Assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{assignment.studentName}</div>
                        <div className="text-sm text-gray-600">{assignment.studentEmail}</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="font-medium">{assignment.expertName}</div>
                        <Badge className={getExpertTypeColor(assignment.expertType)}>
                          {getExpertTypeName(assignment.expertType)}
                        </Badge>
                      </div>
                      <div className="flex-1 text-right">
                        <Badge className={assignment.priority === 'urgent' ? 'bg-red-100 text-red-800' : 
                                        assignment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                        'bg-blue-100 text-blue-800'}>
                          {assignment.priority}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedTab === "students" && (
          <Card>
            <CardHeader>
              <CardTitle>All Students</CardTitle>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="text-center py-8">Loading students...</div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No students found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((student: Student) => (
                    <div key={student.id} className="p-4 border rounded-lg">
                      <div className="font-medium">{student.firstName} {student.lastName}</div>
                      <div className="text-sm text-gray-600">{student.email}</div>
                      {student.studyLevel && (
                        <div className="text-sm text-gray-500 mt-1">
                          {student.studyLevel} - {student.fieldOfStudy}
                        </div>
                      )}
                      {student.preferredCountries && student.preferredCountries.length > 0 && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {student.preferredCountries.slice(0, 2).join(", ")}
                          {student.preferredCountries.length > 2 && ` +${student.preferredCountries.length - 2}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}