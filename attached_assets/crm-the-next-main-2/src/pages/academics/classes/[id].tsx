import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"; // Using your provided table components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Clock,
  Calendar,
  Users,
  MapPin,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import api from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- TYPE DEFINITIONS (Made safer with optional properties) ---

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null; // email can be null
}

interface Student {
  id: number;
  leadId: number;
  lead?: Lead | null; // The lead relation might not be loaded or exist
}

interface EnrolledStudentInfo {
  studentId: number;
  classId: number;
  status: "ENROLLED" | "TRIAL" | "COMPLETED" | "CANCELLED";
  enrolledAt: string;
  student?: Student | null; // The student relation might not be loaded
}

interface ClassDetails {
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
  students?: EnrolledStudentInfo[] | null; // students array could be null
  _count: {
    students: number;
  };
}

// --- HELPER COMPONENTS (No changes) ---

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: { [key: string]: { label: string; className: string } } =
    {
      active: {
        label: "Active",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      completed: {
        label: "Completed",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      archived: {
        label: "Archived",
        className: "bg-gray-200 text-gray-700 border-gray-300",
      },
      ENROLLED: {
        label: "Enrolled",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      TRIAL: {
        label: "Trial",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      COMPLETED: {
        label: "Completed",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      CANCELLED: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    <Badge className={cn("font-semibold text-xs border", config.className)}>
      {config.label}
    </Badge>
  );
};

const sortSchedule = (schedule: string[]): string[] => {
  const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return [...schedule].sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
  );
};

// --- MAIN COMPONENT (With fixes) ---

const ClassDetailsPage = () => {
  const router = useRouter();
  const { id: classId } = router.query;

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;

    const fetchClassDetails = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/classes/${classId}`);
        setClassDetails(response.data.data);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to load class details."
        );
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  if (isLoading) {
    return (
      <Layout>
        <Header title="Loading Class Details..." />
        <div className="p-6 text-center">Loading, please wait...</div>
      </Layout>
    );
  }

  if (!classDetails) {
    return (
      <Layout>
        <Header title="Error" />
        <div className="p-6 text-center text-red-500">
          We couldn't find the details for this class.
        </div>
      </Layout>
    );
  }

  const enrollmentPercentage =
    classDetails.capacity > 0
      ? (classDetails._count.students / classDetails.capacity) * 100
      : 0;

  // Safely access the students array, defaulting to an empty array if it's null or undefined
  const enrolledStudents = classDetails.students || [];

  return (
    <Layout>
      <Header title="Class Details" />
      <div className="p-4 md:p-6 space-y-6">
        {/* Class Info Card (No changes here) */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-7 w-7 text-gray-600" />
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {classDetails.name}
                    </CardTitle>
                    <CardDescription className="text-md">
                      {classDetails.course} Course
                    </CardDescription>
                  </div>
                </div>
              </div>
              <StatusBadge status={classDetails.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <InfoItem
                icon={<User />}
                label="Instructor"
                value={classDetails.instructor}
              />
              <InfoItem
                icon={<Calendar />}
                label="Schedule"
                value={sortSchedule(classDetails.schedule).join(", ")}
              />
              <InfoItem
                icon={<Clock />}
                label="Time"
                value={classDetails.time}
              />
              <InfoItem
                icon={<MapPin />}
                label="Room"
                value={classDetails.room}
              />
              <InfoItem
                icon={<CalendarDays />}
                label="Duration"
                value={`${formatDate(classDetails.startDate)} - ${formatDate(
                  classDetails.endDate
                )}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Enrollment</label>
              <div className="flex items-center gap-4 mt-2">
                <Users className="h-5 w-5 text-gray-500" />
                <Progress value={enrollmentPercentage} className="w-full" />
                <span className="text-sm font-semibold text-gray-700">
                  {classDetails._count.students} / {classDetails.capacity}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Enrolled Students Table Card (FIX APPLIED HERE) --- */}
        <Card>
          <CardHeader>
            <CardTitle>
              Enrolled Students ({classDetails._count.students})
            </CardTitle>
            <CardDescription>
              List of all students currently enrolled in this class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Student Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrolled On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No students are currently enrolled.
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrolledStudents.map((enrollment) => {
                      // **THE FIX**: Safely access nested 'lead' data with fallbacks.
                      const lead = enrollment?.student?.lead;
                      const leadId = lead?.id;
                      const fullName = lead
                        ? `${lead.first_name} ${lead.last_name}`
                        : "Unknown Student";
                      const email = lead?.email ?? "No email";
                      const initials = lead
                        ? `${lead.first_name?.charAt(
                            0
                          )}${lead.last_name?.charAt(0)}`
                        : "??";

                      return (
                        <TableRow key={enrollment.studentId}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {initials.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p>{fullName}</p>
                                <p className="text-xs text-gray-500">{email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={enrollment.status} />
                          </TableCell>
                          <TableCell>
                            {formatDate(enrollment.enrolledAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            {/* Only render the link if we have a leadId to link to */}
                            {leadId ? (
                              <Link href={`/leads/${leadId}`} legacyBehavior>
                                <a className="text-sm font-semibold text-blue-600 hover:underline">
                                  View Profile
                                </a>
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-400">
                                No Profile
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

// Reusable InfoItem component (No changes)
const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-4">
    <div className="text-gray-500 mt-1">{icon}</div>
    <div>
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-gray-600">{value}</p>
    </div>
  </div>
);

export default ClassDetailsPage;
