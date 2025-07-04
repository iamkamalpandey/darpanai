import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowLeftRight,
  MapPin,
  User,
  CheckCircle,
} from "lucide-react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Import toast for notifications
import api from "@/services/api"; // Import the API service

// Define a type for our class object for better type safety
interface Class {
  id: number;
  name: string;
  course: string;
  instructor: string;
  schedule: string[];
  time: string;
  room: string;
  capacity: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled" | "archived";
  branch?: string;
  _count: {
    students: number;
  };
}

// Options for schedule multi-select
const scheduleOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const classStatuses = ["active", "completed", "cancelled", "archived"];

const ClassesPage = () => {
  const [activeTab, setActiveTab] = useState("all-classes");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [viewMode, setViewMode] = useState("cards");

  // State for classes, initialized as an empty array
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for Create/Edit
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    instructor: "",
    schedule: [] as string[],
    time: "",
    room: "",
    capacity: 0,
    startDate: "",
    endDate: "",
    status: "active",
  });

  // --- START: API INTEGRATION ---

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/classes");
      setClasses(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch classes.");
      console.error("Fetch classes error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async () => {
    try {
      // Ensure capacity is a number
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        // Dates need to be in ISO format for Zod validation on the backend
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };
      await api.post("/classes", payload);
      toast.success("Class created successfully!");
      fetchClasses(); // Re-fetch data to show the new class
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create class.");
    }
  };

  const handleEditClass = async () => {
    if (!selectedClass) return;
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        // Dates need to be in ISO format for Zod validation on the backend
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };
      await api.put(`/classes/${selectedClass.id}`, payload);
      toast.success("Class updated successfully!");
      fetchClasses(); // Re-fetch data
      setIsEditDialogOpen(false);
      setSelectedClass(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update class.");
    }
  };

  const handleDeleteClass = (classId: number) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      api
        .delete(`/classes/${classId}`)
        .then(() => {
          toast.success("Class deleted successfully!");
          fetchClasses(); // Re-fetch data
        })
        .catch((error) => {
          toast.error(
            error.response?.data?.message || "Failed to delete class."
          );
        });
    }
  };

  // --- END: API INTEGRATION ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: string } = {
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      archived: "bg-gray-200 text-gray-700",
    };
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          statusConfig[status] || "bg-gray-100 text-gray-800"
        )}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      course: "",
      instructor: "",
      schedule: [],
      time: "",
      room: "",
      capacity: 0,
      startDate: "",
      endDate: "",
      status: "active",
    });
  };

  useEffect(() => {
    if (selectedClass) {
      setFormData({
        name: selectedClass.name,
        course: selectedClass.course,
        instructor: selectedClass.instructor,
        schedule: Array.isArray(selectedClass.schedule)
          ? selectedClass.schedule
          : [],
        time: selectedClass.time,
        room: selectedClass.room,
        capacity: selectedClass.capacity,
        startDate: format(parseISO(selectedClass.startDate), "yyyy-MM-dd"),
        endDate: format(parseISO(selectedClass.endDate), "yyyy-MM-dd"),
        status: selectedClass.status,
      });
    } else {
      resetForm();
    }
  }, [selectedClass]);

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.room.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === "all" || cls.course === courseFilter;
    const matchesStatus = statusFilter === "all" || cls.status === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const AllClassesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-4 items-center">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="IELTS">IELTS</SelectItem>
                <SelectItem value="PTE">PTE</SelectItem>
                <SelectItem value="TOEFL">TOEFL</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {classStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          {/* View Mode Toggle and Create Button */}
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              Table
            </Button>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Class
          </Button>
        </div>
      </div>

      {/* Classes Display */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading classes...</p>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              No classes found.
            </p>
          ) : (
            filteredClasses.map((cls) => (
              <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                <Link href={`/academics/classes/${cls.id}`} className="block">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <div
                        className="flex gap-1"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent link navigation
                          e.stopPropagation();
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedClass(cls);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClass(cls.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{cls.course} Course</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      {getStatusBadge(cls.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{cls.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {Array.isArray(cls.schedule)
                          ? cls.schedule.join(", ")
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{cls.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{cls.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {cls._count.students}/{cls.capacity} students
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (cls._count.students / cls.capacity) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Class Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Enrollment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No classes found.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {cls.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {cls.course}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {cls.instructor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        {Array.isArray(cls.schedule)
                          ? cls.schedule.join(", ")
                          : ""}
                      </div>
                      <div className="text-xs text-gray-400">{cls.time}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {cls._count.students}/{cls.capacity}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(cls.status)}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedClass(cls);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClass(cls.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <Header title="Class Management" />
      <div className="p-2.5">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="all-classes"
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              All Classes
            </TabsTrigger>
            <TabsTrigger
              value="transfers"
              className="flex items-center gap-2"
              disabled
            >
              <ArrowLeftRight className="h-4 w-4" />
              Transfers (Coming Soon)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-classes">
            <AllClassesTab />
          </TabsContent>
          <TabsContent value="transfers">{/* Transfers UI Here */}</TabsContent>
        </Tabs>

        {/* Create/Edit Class Dialog */}
        <Dialog
          open={isCreateDialogOpen || isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedClass(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditDialogOpen ? "Edit Class" : "Create New Class"}
              </DialogTitle>
              <DialogDescription>
                {isEditDialogOpen
                  ? "Update class information"
                  : "Fill in the details to create a new class"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter class name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) =>
                    setFormData({ ...formData, course: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IELTS">IELTS</SelectItem>
                    <SelectItem value="PTE">PTE</SelectItem>
                    <SelectItem value="TOEFL">TOEFL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  placeholder="Enter instructor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule (Days of Week)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start font-normal"
                    >
                      {formData.schedule.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.schedule.map((day) => (
                            <Badge key={day} variant="secondary">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span>Select days</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search days..." />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                          {scheduleOptions.map((day) => (
                            <CommandItem
                              key={day}
                              onSelect={() => {
                                const newSchedule = formData.schedule.includes(
                                  day
                                )
                                  ? formData.schedule.filter((d) => d !== day)
                                  : [...formData.schedule, day];
                                setFormData({
                                  ...formData,
                                  schedule: newSchedule,
                                });
                              }}
                            >
                              <CheckCircle
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.schedule.includes(day)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {day}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  placeholder="e.g., 9:00 AM - 11:00 AM"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  placeholder="Enter room number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Maximum students"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>

              {isEditDialogOpen && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as
                          | "active"
                          | "completed"
                          | "cancelled"
                          | "archived",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {classStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={isEditDialogOpen ? handleEditClass : handleCreateClass}
              >
                {isEditDialogOpen ? "Update Class" : "Create Class"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};
export default ClassesPage;
