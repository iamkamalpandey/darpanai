//@ts-nocheck
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Branch {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface VisitorStatsData {
  totalVisitors: number;
  totalApplications: number;
  branchWiseStats: {
    branchId: number;
    branchName: string;
    applicationsCount: number;
  }[];
  dateRange: {
    from: string;
    to: string;
  } | null;
}

const getDefaultDateRange = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return {
    from: sevenDaysAgo,
    to: today,
  };
};

const VisitorStats = () => {
  const [data, setData] = useState<VisitorStatsData | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>(
    getDefaultDateRange()
  );

  useEffect(() => {
    // Fetch branches and then fetch stats
    api.get("branch").then((response) => {
      setBranches(response.data.data);
      fetchStats(); // Fetch stats immediately after getting branches
    });
  }, []);

  useEffect(() => {
    if (branches.length > 0) {
      fetchStats();
    }
  }, [selectedBranch, date, branches.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        event.target instanceof Node &&
        !event.target.closest(".relative")
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const fetchStats = () => {
    const params: any = {};

    if (selectedBranch) {
      params.branchId = selectedBranch;
    }

    if (date?.from) {
      const fromDate = new Date(date.from);
      fromDate.setHours(0, 0, 0, 0);
      params.dateFrom = fromDate.toISOString();
    }

    if (date?.to) {
      const toDate = new Date(date.to);
      toDate.setHours(23, 59, 59, 999);
      params.dateTo = toDate.toISOString();
    }

    api.get("/visitor-stats", { params }).then((response) => {
      setData(response.data.data);
    });
  };

  const chartData = React.useMemo(() => {
    if (!data?.branchWiseStats) return null;
    return {
      labels: data.branchWiseStats.map((item) => item.branchName),
      datasets: [
        {
          label: "Applications",
          data: data.branchWiseStats.map((item) => item.applicationsCount),
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          borderColor: "rgba(53, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  return (
    <div className="flex w-full flex-col space-y-6">
      <div className="flex w-full items-center justify-between">
        <h2 className="font-medium text-2xl underline underline-offset-8">
          Visitor Statistics
        </h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-[280px] px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <div className="flex items-center justify-between">
                <span className={!selectedBranch ? "text-black" : ""}>
                  {selectedBranch
                    ? branches.find((b) => b.id.toString() === selectedBranch)
                        ?.name
                    : "All Branches"}
                </span>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <ul className="py-1 max-h-60 overflow-auto">
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedBranch("");
                      setIsDropdownOpen(false);
                    }}
                  >
                    All Branches
                  </li>
                  {branches.map((branch) => (
                    <li
                      key={branch.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedBranch(branch.id.toString());
                        setIsDropdownOpen(false);
                      }}
                    >
                      {branch.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalVisitors ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.totalApplications ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Application Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.totalVisitors
                ? Math.round(
                    (data.totalApplications / data.totalVisitors) * 100
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {chartData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Branch-wise Applications</CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowChart(!showChart)}
                className="flex items-center space-x-2"
              >
                {showChart ? (
                  <>
                    <span>Hide Chart</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Show Chart</span>
                    <svg
                      className="w-4 h-4 transform -rotate-90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`transition-all duration-300 ease-in-out ${
                showChart ? "h-[300px] opacity-100" : "h-0 opacity-0"
              } overflow-hidden`}
            >
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                  },
                  scales: {
                    x: {
                      type: "category",
                      beginAtZero: true,
                    },
                    y: {
                      type: "linear",
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {data?.branchWiseStats && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Branch Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Branch</th>
                    <th className="px-6 py-3 text-right">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {data.branchWiseStats.map((stat) => (
                    <tr key={stat.branchId} className="bg-white border-b">
                      <td className="px-6 py-4">{stat.branchName}</td>
                      <td className="px-6 py-4 text-right">
                        {stat.applicationsCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VisitorStats;
