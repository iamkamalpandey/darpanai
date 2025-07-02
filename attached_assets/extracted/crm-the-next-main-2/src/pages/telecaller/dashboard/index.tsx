import React, { useEffect, useState } from "react";
import Layout from "../layout";

import Header from "@/components/shared/Header/Header";
import api from "@/services/api";
import { addDays, subDays, subMonths } from "date-fns";
import format from "date-fns/format";
import "react-datepicker/dist/react-datepicker.css";
import TelecallerLeadsTable from "@/components/common/telecaller/TelecallerLeadsTable";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const index = () => {
  const [data, setData] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const fetchData = (start, end) => {
    const params = {};
    if (start && end) {
      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    }

    api.get("telecaller/dashboard", { params }).then((response) => {
      setData(response.data.data);
    });
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate]);

  const handleQuickSelect = (value) => {
    setSelectedQuickFilter(value);
    const today = new Date();
    switch (value) {
      case "today":
        setStartDate(today);
        setEndDate(today);
        break;
      case "yesterday": {
        const yesterday = subDays(today, 1);
        setStartDate(yesterday);
        setEndDate(yesterday);
        break;
      }
      case "week": {
        setEndDate(today);
        setStartDate(subDays(today, 7));
        break;
      }
      case "month": {
        setEndDate(today);
        setStartDate(subMonths(today, 1));
        break;
      }
      case "3months": {
        setEndDate(today);
        setStartDate(subMonths(today, 3));
        break;
      }
    }
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedQuickFilter("");
  };

  const hasActiveFilters = startDate || endDate || selectedQuickFilter;

  return (
    <Layout>
      <div className="flex w-full">
        <div className="flex flex-col w-full">
          <Header title="Dashboard" />

          <div className="flex w-full flex-col px-6 gap-5  my-2.5 ">
            <div className="  flex w-full flex-col  ">
              <div className="flex w-full items-center justify-between">
                <h2 className="font-medium text-2xl underline underline-offset-8">
                  User Stats
                </h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="grid gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-52 justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate
                              ? format(startDate, "dd MMMM, yyyy")
                              : "Start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-52 justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate
                              ? format(endDate, "dd MMMM, yyyy")
                              : "End date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) =>
                              date < (startDate ?? new Date())
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <Select
                    onValueChange={handleQuickSelect}
                    value={selectedQuickFilter}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Quick select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last 1 month</SelectItem>
                      <SelectItem value="3months">Last 3 months</SelectItem>
                    </SelectContent>
                  </Select>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="h-10 px-3 gap-2.5"
                    >
                      <p>Clear Filter</p>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear filters</span>
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-4 w-full gap-5 ">
                <div
                  key="1"
                  className="w-full rounded-lg bg-blue-500 px-4 py-5 shadow sm:p-6"
                >
                  <dt className="truncate text-sm font-medium text-white">
                    Raw Data
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {data?.assignedData}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-green-500 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-white">
                    Pending Follow Up
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {data?.upcomingFollowUp}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-red-500 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-white">
                    Completed Data
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {data?.completedData}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-gray-600 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-white">
                    Archived Leads
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {data?.archivedData}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-orange-600 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-white">
                    Total Visitors
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {data?.uniqueVisitors}
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-gray-600 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-white">
                    Total Leads
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {data?.total}
                  </dd>
                </div>
              </div>
            </div>
            <h2 className="font-medium text-2xl underline underline-offset-8">
              Follow Up
            </h2>

            <TelecallerLeadsTable initialStatus="followup" />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default index;
