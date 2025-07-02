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

interface LeadStatsData {
  totalLeadsAdded?: number;
  totalLeadsArchived?: number;
  totalLeadsAssigned?: number;
  totalLeadsUnassigned?: number;
}

const LeadStats = () => {
  const [data, setData] = useState<LeadStatsData>({});
  const [date, setDate] = React.useState<Date>(new Date());

  useEffect(() => {
    api
      .get("/admin/lead-stats", {
        params: {
          date: date,
        },
      })
      .then((response) => {
        setData(response.data.data);
      });
  }, [date]);

  return (
    <>
      <div className="flex w-full flex-col">
        <div className="flex w-full items-center justify-between">
          <h2 className="font-medium text-2xl underline underline-offset-8">
            Lead Stats
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
            className="w-full rounded-lg bg-green-500 px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-white">
              Total Leads Added
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {data.totalLeadsAdded ?? 0}
            </dd>
          </div>

          <div
            key="3"
            className="w-full rounded-lg bg-blue-500 px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-white">
              Total Leads Assigned
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {data.totalLeadsAssigned ?? 0}
            </dd>
          </div>
          <div
            key="4"
            className="w-full rounded-lg bg-gray-600 px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-white">
              Total Leads Unassigned
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {data.totalLeadsUnassigned ?? 0}
            </dd>
          </div>
          <div
            key="2"
            className="w-full rounded-lg bg-red-500 px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-white">
              Total Leads Archived
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {data.totalLeadsArchived ?? 0}
            </dd>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadStats;
