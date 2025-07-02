//@ts-nocheck
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
import { DateRange } from "react-day-picker";
import { DateTime } from "luxon";
import { Line, Bar } from "react-chartjs-2";

interface VisitorStatsData {
  totalVisitors?: number;
  totalUnassignedLeads?: number;
  visaVisitors?: number;
  visitorsOverTime?: { date: string; count: number }[];
}

const VisitorStats = () => {
  const [data, setData] = useState<VisitorStatsData>({});
  const [date, setDate] = React.useState<Date>(new Date());

  useEffect(() => {
    api
      .get("/admin/visitor-stats", {
        params: {
          date: date,
        },
      })
      .then((response) => {
        setData(response.data.data);
      });
  }, [date]);

  const chartData = React.useMemo(() => {
    if (!data.visitorsOverTime) return null;
    const labels = data.visitorsOverTime.map((item) => item.date);
    const datasets = [
      {
        label: "Visitors",
        data: data.visitorsOverTime.map((item) => item.count),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ];
    return { labels, datasets };
  }, [data]);

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-center justify-between">
        <h2 className="font-medium text-2xl underline underline-offset-8">
          Visitor Stats
        </h2>
        <div className={cn("grid gap-2")}>
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
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-4 w-full gap-5">
        <div
          key="1"
          className="w-full rounded-lg bg-blue-500 px-4 py-5 shadow sm:p-6"
        >
          <dt className="truncate text-sm font-medium text-white">
            Total Visitors
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {data.totalVisitors ?? 0}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-green-500 px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-white">
            Walkin Visitors
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {data.totalUnassignedLeads ?? 0}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-gray-600 px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-white">
            Visa Visitors
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {data.visaVisitors ?? 0}
          </dd>
        </div>
      </div>
      {chartData && (
        <div className="mt-5">
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top" as const,
                },
                title: {
                  display: true,
                  text: "Visitor Growth Over Time",
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VisitorStats;
