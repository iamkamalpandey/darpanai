import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useDebounce } from "use-debounce";

// UI Components from Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  UserPlus,
  Calendar,
  Clock,
  Users,
  List,
  MapPin,
  Search,
  X,
} from "lucide-react";

// Main Layout Components
import Layout from "../layout"; // Adjust path if needed
import Header from "@/components/shared/Header/Header"; // Adjust path if needed
import { Label } from "@/components/ui/label";

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
interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Participant extends Lead {
  isStudent: boolean;
}

interface MockTestDetails {
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
  status: string;
  participants: {
    lead: {
      id: number;
      first_name: string;
      last_name: string;
      email: string | null;
      Student: any[] | null; // Student model is an array if it exists
    };
  }[];
}

// --- 3. MOCK TEST DETAILS PAGE COMPONENT ---
const MockTestDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const testId = Number(id);

  // Data State
  const [mockTest, setMockTest] = useState<MockTestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Participant Management State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch Mock Test Data
  const fetchMockTestDetails = useCallback(async () => {
    if (!testId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get<MockTestDetails>(
        `${MOCK_TEST_URL}/${testId}`
      );
      setMockTest(data);
    } catch (err) {
      setError("Failed to fetch mock test details.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchMockTestDetails();
  }, [fetchMockTestDetails]);

  // Search for Leads to Add
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const { data } = await api.get<Lead[]>(
          `${MOCK_TEST_URL}/search/leads`,
          {
            params: { search: query },
          }
        );
        // Filter out leads already participating or selected
        const participantIds = new Set(
          mockTest?.participants.map((p) => p.lead.id) || []
        );
        const selectedIds = new Set(selectedLeads.map((l) => l.id));
        const filteredResults = data.filter(
          (lead) => !participantIds.has(lead.id) && !selectedIds.has(lead.id)
        );
        setSearchResults(filteredResults);
      } catch (err) {
        console.error("Failed to search leads:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [mockTest, selectedLeads]
  );

  useEffect(() => {
    handleSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, handleSearch]);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLeads((prev) => [...prev, lead]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveSelectedLead = (leadId: number) => {
    setSelectedLeads((prev) => prev.filter((lead) => lead.id !== leadId));
  };

  // Assign Selected Leads to the Test
  const handleAssignParticipants = async () => {
    if (selectedLeads.length === 0) return;
    setIsAssigning(true);
    try {
      const leadIds = selectedLeads.map((lead) => lead.id);
      await api.post(`${MOCK_TEST_URL}/${testId}/assign`, { leadIds });
      setSelectedLeads([]);
      fetchMockTestDetails(); // Refresh the participant list
    } catch (err: any) {
      console.error("Failed to assign participants:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while assigning participants."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
      </Layout>
    );
  }

  if (error || !mockTest) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen text-red-500">
          {error || "Mock test not found."}
        </div>
      </Layout>
    );
  }

  const registeredCount = mockTest.participants.length;
  const availableSeats = mockTest.maxParticipants - registeredCount;

  return (
    <Layout>
      <Header title="Mock Test Details" />
      <div className="p-4 md:p-8 space-y-8">
        {/* Test Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{mockTest.title}</CardTitle>
            <CardDescription>
              {mockTest.course} - {mockTest.type}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-semibold">Date</p>
                <p>{new Date(mockTest.scheduledDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-semibold">Time</p>
                <p>{mockTest.scheduledTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-semibold">Venue</p>
                <p>{mockTest.venue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-semibold">Capacity</p>
                <p>
                  {registeredCount} / {mockTest.maxParticipants}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  mockTest.status === "completed" ? "default" : "outline"
                }
              >
                {mockTest.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-3 col-span-2 md:col-span-1">
              <List className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-semibold">Sections</p>
                <p>{mockTest.sections.join(", ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participant Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Participants</CardTitle>
            <CardDescription>
              Add or view participants for this mock test. {availableSeats}{" "}
              seats remaining.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add Participants Section */}
            <div className="space-y-4 mb-6">
              <Label htmlFor="search-leads">Add Participants</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search-leads"
                  placeholder="Search for leads by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleSelectLead(lead)}
                      >
                        {lead.first_name} {lead.last_name} ({lead.email})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedLeads.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Selected for Assignment:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLeads.map((lead) => (
                      <Badge
                        key={lead.id}
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        {lead.first_name} {lead.last_name}
                        <button
                          onClick={() => handleRemoveSelectedLead(lead.id)}
                          className="rounded-full hover:bg-gray-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={handleAssignParticipants}
                    disabled={isAssigning}
                    className="mt-4"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isAssigning
                      ? "Assigning..."
                      : `Assign ${selectedLeads.length} Participant(s)`}
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Registered Participants Table */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Registered Participants ({registeredCount})
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTest.participants.length > 0 ? (
                      mockTest.participants.map((p) => (
                        <TableRow key={p.lead.id}>
                          <TableCell className="font-medium">
                            {p.lead.first_name} {p.lead.last_name}
                          </TableCell>
                          <TableCell>{p.lead.email || "N/A"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                p.lead.Student && p.lead.Student.length > 0
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {p.lead.Student && p.lead.Student.length > 0
                                ? "Student"
                                : "Lead"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No participants have been assigned to this test yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MockTestDetailsPage;
