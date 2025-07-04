import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useDebounce } from "use-debounce";

// UI Components from Shadcn
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Calendar,
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Timer,
  MapPin,
  CheckCircle,
} from "lucide-react";

// Main Layout Components
import Layout from "../layout"; // Adjust path if needed
import Header from "@/components/shared/Header/Header"; // Adjust path if needed

// --- 1. API INSTANCE (Self-contained) ---
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const MOCK_TEST_URL = "/mock-tests";

// --- 2. TYPE DEFINITIONS (Self-contained) ---
interface MockTest {
  id: number;
  title: string;
  course: string;
  type: string;
  duration: number;
  sections: string[];
  scheduledDate: string;
  scheduledTime: string;
  venue: string;
  maxParticipants: number;
  status: "draft" | "scheduled" | "active" | "completed" | "cancelled";
  _count?: {
    participants: number;
  };
}

type CreateMockTestDto = Omit<MockTest, "id" | "_count">;
type UpdateMockTestDto = Partial<CreateMockTestDto>;

interface MockTestQueryFilters {
  course?: string;
  status?: string;
  type?: string;
  search?: string;
}

// --- 3. REACT COMPONENT ---

const initialFormData: CreateMockTestDto = {
  title: "",
  course: "",
  type: "",
  duration: 0,
  sections: [],
  scheduledDate: "",
  scheduledTime: "",
  venue: "",
  maxParticipants: 0,
  status: "draft",
};

const MockTestsPage = () => {
  const router = useRouter();

  // State Management
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog and Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [formData, setFormData] = useState<
    CreateMockTestDto | UpdateMockTestDto
  >(initialFormData);

  // View and Filter State
  const [viewMode, setViewMode] = useState("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // API Interaction Logic
  const fetchMockTests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: MockTestQueryFilters = {
        search: debouncedSearchQuery || undefined,
        course: courseFilter === "all" ? undefined : courseFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        type: typeFilter === "all" ? undefined : typeFilter,
      };
      const { data } = await api.get<MockTest[]>(MOCK_TEST_URL, {
        params: filters,
      });
      setMockTests(data);
    } catch (err) {
      setError("Failed to fetch mock tests.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, courseFilter, statusFilter, typeFilter]);

  useEffect(() => {
    fetchMockTests();
  }, [fetchMockTests]);

  // Handlers
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange =
    (id: keyof CreateMockTestDto) => (value: string) => {
      setFormData((prev) => ({ ...prev, [id]: value as any }));
    };

  const handleOpenDialog = (test?: MockTest) => {
    if (test) {
      setIsEditMode(true);
      setSelectedTestId(test.id);
      setFormData({
        ...test,
        scheduledDate: new Date(test.scheduledDate).toISOString().split("T")[0], // Format for date input
      });
    } else {
      setIsEditMode(false);
      setSelectedTestId(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedTestId(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    try {
      const submissionData = { ...formData };

      // Prisma doesn't allow `id` or `_count` in the update payload.
      // We must remove them before sending the PUT request.
      delete (submissionData as Partial<MockTest>).id;
      delete (submissionData as Partial<MockTest>)._count;

      const dataToSubmit = {
        ...submissionData,
        duration: Number(submissionData.duration) || 0,
        maxParticipants: Number(submissionData.maxParticipants) || 0,
      };

      if (isEditMode && selectedTestId) {
        await api.put(`${MOCK_TEST_URL}/${selectedTestId}`, dataToSubmit);
      } else {
        await api.post(MOCK_TEST_URL, dataToSubmit);
      }
      fetchMockTests(); // Refresh data
      handleCloseDialog();
    } catch (err: any) {
      console.error("Failed to save mock test:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save the mock test. Please try again."
      );
    }
  };

  const handleDelete = async (testId: number) => {
    if (window.confirm("Are you sure you want to delete this mock test?")) {
      try {
        await api.delete(`${MOCK_TEST_URL}/${testId}`);
        fetchMockTests(); // Refresh data
      } catch (err: any) {
        console.error("Failed to delete mock test:", err);
        setError(
          err.response?.data?.message || "Failed to delete the mock test."
        );
      }
    }
  };

  const handleViewDetails = (testId: number) => {
    router.push(`/academics/mock-tests/${testId}`);
  };

  // UI Helpers
  const cn = (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(" ");

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: string } = {
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          statusConfig[status]
        )}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const totalParticipants = mockTests.reduce(
    (sum, test) => sum + (test._count?.participants || 0),
    0
  );

  return (
    <Layout>
      <Header title="Mock Tests Management" />
      <div className="p-2.5">
        <div className="space-y-6">
          {/* Header & Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search mock tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full Test">Full Test</SelectItem>
                  <SelectItem value="Practice Test">Practice Test</SelectItem>
                  <SelectItem value="Sectional Test">Sectional Test</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
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
                onClick={() => handleOpenDialog()}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Create Mock Test
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {mockTests.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {mockTests.filter((t) => t.status === "scheduled").length}
                  </div>
                  <div className="text-sm text-gray-600">Scheduled</div>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {mockTests.filter((t) => t.status === "completed").length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {totalParticipants}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Participants
                  </div>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </CardContent>
            </Card>
          </div>

          {/* Display Area */}
          {isLoading ? (
            <div className="text-center py-10">Loading...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTests.map((test) => (
                <Card
                  key={test.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-2">
                          {test.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {test.course}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span>{test.type}</span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(test)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(test.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      {getStatusBadge(test.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{test.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(test.scheduledDate).toLocaleDateString()} at{" "}
                        {test.scheduledTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{test.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {test._count?.participants || 0} /{" "}
                        {test.maxParticipants} participants
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            ((test._count?.participants || 0) /
                              test.maxParticipants) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleViewDetails(test.id)}
                      >
                        <Eye className="h-4 w-4" /> View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Test Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course & Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Participants
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
                  {mockTests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {test.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {test.duration} min
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs w-fit">
                          {test.course}
                        </span>
                        <div className="text-xs text-gray-600 mt-1">
                          {test.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          {new Date(test.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {test.scheduledTime} at {test.venue}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {test._count?.participants || 0} /{" "}
                        {test.maxParticipants}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(test.status)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(test.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(test)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(test.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Mock Test" : "Create New Mock Test"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update the test information."
                  : "Fill in the details for the new test."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Test Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., IELTS Academic Full Test"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.course}
                  onValueChange={handleSelectChange("course")}
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
                <Label htmlFor="type">Test Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={handleSelectChange("type")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Test">Full Test</SelectItem>
                    <SelectItem value="Sectional Test">
                      Sectional Test
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 180"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  placeholder="e.g., 50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleSelectChange("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="scheduledTime">Scheduled Time</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="venue">Venue / Location</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Hall"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {isEditMode ? "Update Test" : "Create Test"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MockTestsPage;
