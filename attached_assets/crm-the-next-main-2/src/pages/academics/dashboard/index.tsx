import React, { useEffect, useState } from "react";
import Layout from "../layout";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Header from "@/components/shared/Header/Header";
import { useAuth } from "@/contexts/AuthContext";

const greetingTime = require("greeting-time");
import date from "date-and-time";
import { toast } from "sonner";

interface AcademicStatsData {
  totalStudents?: number;
  enrolledStudents?: number;
  trialStudents?: number;
  totalClasses?: number;
  todaysClasses?: number;
  upcomingClasses?: number;
  attendanceRate?: number;
  mockTestsCompleted?: number;
  mockTestsRemaining?: number;
  ieltsBooksPending?: number;
  pteTestsScheduled?: number;
  completedResults?: number;
  pendingResults?: number;
  classConflicts?: number;
  staffAssigned?: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  textColor?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  bgColor,
  textColor = "text-white",
  subtitle,
}) => (
  <div className={cn("w-full rounded-lg px-4 py-5 shadow-sm", bgColor)}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <dt className={cn("truncate text-sm font-medium", textColor)}>
          {title}
        </dt>
        <dd
          className={cn(
            "mt-1 text-3xl font-semibold tracking-tight",
            textColor
          )}
        >
          {value}
        </dd>
        {subtitle && (
          <p className={cn("text-xs mt-1 opacity-90", textColor)}>{subtitle}</p>
        )}
      </div>
      <div className={cn("text-2xl opacity-80", textColor)}>{icon}</div>
    </div>
  </div>
);

const AcademicDashboard = () => {
  const now = new Date();
  const { user } = useAuth();
  const [data, setData] = useState<AcademicStatsData>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcademicStats();
  }, [selectedDate]);

  const fetchAcademicStats = async () => {
    setLoading(true);
    try {
      // The API endpoint you created is called here.
      const response = await api.get("/academics/dashboard-stats", {
        params: {
          // You can pass the date if your backend supports date-based filtering
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
        },
      });

      // Based on your backend response structure { status, message, data }
      if (response.data.status === "success") {
        setData(response.data.data);
      } else {
        // Handle cases where the API returns an error status
        toast.error("Failed to load dashboard data.");
      }
    } catch (error) {
      console.error("Error fetching academic stats:", error);
      toast.error("An error occurred while fetching academic statistics.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex w-full">
        <div className="flex flex-col w-full">
          <Header title="Academic Dashboard" />
          <div className="flex w-full flex-col px-6 gap-6 my-2.5">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-medium">
                  {greetingTime(new Date())}, {user?.name}
                </h2>
                <p className="text-sm font-medium text-slate-700">
                  {date.format(now, "ddd, MMM DD, YYYY")}
                </p>
              </div>
              <div className={cn("grid gap-2")}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Student Statistics */}
            <div className="flex w-full flex-col">
              <h2 className="font-medium text-2xl underline underline-offset-8 mb-5">
                Student Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  title="Total Students"
                  value={data.totalStudents ?? 0}
                  icon={<Users />}
                  bgColor="bg-blue-600"
                />
                <StatCard
                  title="Enrolled Students"
                  value={data.enrolledStudents ?? 0}
                  icon={<CheckCircle />}
                  bgColor="bg-green-600"
                />
                <StatCard
                  title="Trial Students"
                  value={data.trialStudents ?? 0}
                  icon={<Clock />}
                  bgColor="bg-orange-500"
                />
                <StatCard
                  title="Staff Assigned"
                  value={data.staffAssigned ?? 0}
                  icon={<Users />}
                  bgColor="bg-purple-600"
                />
              </div>
            </div>

            {/* Class Statistics */}
            <div className="flex w-full flex-col">
              <h2 className="font-medium text-2xl underline underline-offset-8 mb-5">
                Class Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  title="Total Classes"
                  value={data.totalClasses ?? 0}
                  icon={<BookOpen />}
                  bgColor="bg-indigo-600"
                />
                <StatCard
                  title="Today's Classes"
                  value={data.todaysClasses ?? 0}
                  icon={<Clock />}
                  bgColor="bg-cyan-600"
                />
                <StatCard
                  title="Upcoming Classes"
                  value={data.upcomingClasses ?? 0}
                  icon={<TrendingUp />}
                  bgColor="bg-emerald-600"
                />
                <StatCard
                  title="Class Conflicts"
                  value={data.classConflicts ?? 0}
                  icon={<AlertCircle />}
                  bgColor="bg-red-600"
                />
              </div>
            </div>

            {/* Academic Performance */}
            <div className="flex w-full flex-col">
              <h2 className="font-medium text-2xl underline underline-offset-8 mb-5">
                Academic Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <StatCard
                  title="Attendance Rate"
                  value={`${data.attendanceRate ?? 0}%`}
                  icon={<CheckCircle />}
                  bgColor="bg-green-500"
                  subtitle="Overall attendance"
                />
                <StatCard
                  title="Mock Tests Completed"
                  value={data.mockTestsCompleted ?? 0}
                  icon={<FileText />}
                  bgColor="bg-blue-500"
                  subtitle="This month"
                />
                <StatCard
                  title="Mock Tests Remaining"
                  value={data.mockTestsRemaining ?? 0}
                  icon={<Clock />}
                  bgColor="bg-amber-500"
                  subtitle="Pending tests"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex w-full flex-col">
              <h2 className="font-medium text-2xl underline underline-offset-8 mb-5">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  className="h-16 bg-blue-600 hover:bg-blue-700 flex flex-col gap-1"
                  asChild
                >
                  <Link href="/academics/students">
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Manage Students</span>
                  </Link>
                </Button>
                <Button
                  className="h-16 bg-green-600 hover:bg-green-700 flex flex-col gap-1"
                  asChild
                >
                  <Link href="/academics/classes/schedule">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-sm">Schedule Classes</span>
                  </Link>
                </Button>
                <Button className="h-16 bg-purple-600 hover:bg-purple-700 flex flex-col gap-1">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">Mock Tests</span>
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span>Loading academic data...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AcademicDashboard;
