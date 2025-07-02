import api from "@/services/api";
import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination"; // Assuming you have this component
import { formatDate } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Define a type for a single student record for better type safety
interface Student {
  id: number;
  leadId: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  enrollmentDate: string;
  studentStatus: "TRIAL" | "ENROLLED" | "CANCELLED" | "COMPLETED" | "N/A";
  enrolledClasses: string[];
  booksTaken: string[];
}

// Define the shape of our reducer state
interface StudentsState {
  students: Student[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalStudents: number;
  searchValue: string;
  loading: boolean;
}

// The reducer function to manage the component's state
function studentsReducer(state: StudentsState, action: any): StudentsState {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        loading: true, // Only set loading to true, don't clear students
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        students: action.payload.students,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        totalStudents: action.payload.totalStudents,
        loading: false,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        loading: false, // Stop loading on error
      };
    case "CHANGE_PAGE":
      return {
        ...state,
        currentPage: action.page,
      };
    case "CHANGE_PAGE_SIZE":
      return {
        ...state,
        pageSize: action.pageSize,
        currentPage: 1, // Reset to first page
      };
    case "CHANGE_SEARCH_VALUE":
      return {
        ...state,
        searchValue: action.searchValue,
        currentPage: 1, // Reset to first page
      };
    default:
      return state;
  }
}

export default function AcademicsStudentsTable() {
  const [state, dispatch] = useReducer(studentsReducer, {
    students: [],
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalStudents: 0,
    searchValue: "",
    loading: true,
  });

  const {
    students,
    currentPage,
    totalPages,
    totalStudents,
    pageSize,
    searchValue,
    loading,
  } = state;

  const [statusFilter, setStatusFilter] = useState("ENROLLED");
  const [courseFilter, setCourseFilter] = useState("all");
  const [localSearch, setLocalSearch] = useState("");

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      dispatch({ type: "CHANGE_SEARCH_VALUE", searchValue: localSearch });
    }, 500);
    return () => clearTimeout(timerId);
  }, [localSearch]);

  // Fetch students whenever dependencies change
  useEffect(() => {
    const fetchStudents = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const response = await api.get("/students", {
          params: {
            page: currentPage,
            pageSize,
            searchValue,
            status: statusFilter === "all" ? undefined : statusFilter,
            course: courseFilter === "all" ? undefined : courseFilter,
          },
        });

        dispatch({
          type: "FETCH_SUCCESS",
          payload: response.data.data,
        });
      } catch (error) {
        toast.error("Failed to fetch students.");
        console.error("Failed to fetch students:", error);
        dispatch({ type: "FETCH_FAILURE" }); // Dispatch failure action
      }
    };
    fetchStudents();
  }, [currentPage, pageSize, searchValue, statusFilter, courseFilter]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      dispatch({ type: "CHANGE_PAGE", page });
    }
  };

  const handlePageSizeChange = (value: string) => {
    dispatch({ type: "CHANGE_PAGE_SIZE", pageSize: parseInt(value, 10) });
  };

  // Helper to get styled badge based on student status
  const getStatusBadge = (status: Student["studentStatus"]) => {
    const statusStyles: Record<string, string> = {
      ENROLLED: "bg-green-100 text-green-800 border-green-200",
      TRIAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
      COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      "N/A": "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      <Badge
        variant="outline"
        className={`capitalize ${statusStyles[status] || statusStyles["N/A"]}`}
      >
        {status.toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50/50 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Input
          placeholder="Search by name, email, phone..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-auto min-w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ENROLLED">Enrolled</SelectItem>
              <SelectItem value="TRIAL">Trial</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-auto min-w-[150px]">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="IELTS">IELTS</SelectItem>
              <SelectItem value="PTE">PTE</SelectItem>
              <SelectItem value="TOEFL">TOEFL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Total Students:{" "}
        <span className="font-semibold text-primary">{totalStudents}</span>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[250px]">Student Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrolled Classes</TableHead>
              <TableHead>Books Taken</TableHead>
              <TableHead>Enrollment Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading students...
                </TableCell>
              </TableRow>
            ) : !loading && students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No students found for the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student: Student) => (
                <TableRow key={student.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                    <div className="text-sm text-gray-500">
                      {student.phone_number}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(student.studentStatus)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.enrolledClasses.length > 0 ? (
                        student.enrolledClasses.map((className) => (
                          <Badge key={className} variant="secondary">
                            {className}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">N/A</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.booksTaken.length > 0 ? (
                        student.booksTaken.map((bookTitle) => (
                          <Badge key={bookTitle} variant="secondary">
                            {bookTitle}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">No books taken</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(student.enrollmentDate)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" asChild>
                      <Link href={`/academics/leads/${student.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalStudents}
          pageSize={pageSize}
          onPrevious={() => handlePageChange(currentPage - 1)}
          onNext={() => handlePageChange(currentPage + 1)}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
