import api from "@/services/api";
import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Pagination from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, CreditCard, Settings, Keyboard, FilterIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

const loadingPlaceholder = (
  <tr>
    <td className="px-6 py-4">
      <Skeleton className="h-8" />
    </td>
    <td className="px-3 py-4">
      <Skeleton className="h-8" />
    </td>
    <td className="px-3 py-4">
      <Skeleton className="h-8 w-24 mx-auto" />
    </td>
    <td className="px-3 py-4">
      <Skeleton className="h-8 w-24 mx-auto" />
    </td>
    <td className="px-3 py-4 text-center">
      <Skeleton className="h-8 w-24 mx-auto" />
    </td>
  </tr>
);

function leadsReducer(state: any, action: any) {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        leads: [],
        loading: true,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        leads: action.payload.leads,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        pageSize: action.payload.pageSize,
        totalLeads: action.payload.totalLeads,
        loading: false,
      };
    case "CHANGE_PAGE":
      return {
        ...state,
        currentPage: action.page,
        pageSize: action.pageSize,
      };
    case "CHANGE_SEARCH_VALUE":
      return {
        ...state,
        searchValue: action.searchValue,
      };
    case "CHANGE_FILTER":
      return {
        ...state,
        filter: action.filter,
      };
    case "CHANGE_VISIT_FILTER":
      return {
        ...state,
        visitOrder: action.visitOrder,
      };

    default:
      return state;
  }
}

export default function LeadsTable() {
  const [state, dispatch] = useReducer(leadsReducer, {
    leads: [],
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalLeads: 0,
    visitOrder: "",
  });

  const {
    leads,
    currentPage,
    totalPages,
    totalLeads,
    pageSize,
    searchValue,
    loading,
    visitOrder,
  } = state;
  const [filter, setFilter] = useState("all");
  const [visitFilter, setVisitOrder] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  useEffect(() => {
    const timerId = setTimeout(() => {
      dispatch({ type: "CHANGE_SEARCH_VALUE", searchValue: debouncedSearch });
    }, 300);
    return () => clearTimeout(timerId);
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchLeads = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const response = await api.get("manager/leads", {
          params: {
            page: currentPage,
            pageSize,
            searchValue,
            visitOrder: visitOrder,
            type: filter === "all" ? undefined : filter,
          },
        });
        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            leads: response.data.data.leads,
            totalPages: response.data.data.totalPages,
            currentPage,
            pageSize,
            searchValue,
            totalLeads: response.data.data.totalLeads,
          },
        });
      } catch (error) {
        console.error("Failed to fetch leads:", error);
        dispatch({ type: "FETCH_INIT" });
      }
    };
    fetchLeads();
  }, [currentPage, pageSize, searchValue, filter, visitOrder]);
  const handleFilterChange = (e: any) => {
    const newFilter = e.target.value;
    dispatch({ type: "CHANGE_FILTER", filter: newFilter });
    setFilter(newFilter);
  };
  const handlePageChange = (page: any) => {
    if (page < 1 || page > totalPages) return;
    dispatch({ type: "CHANGE_PAGE", page, pageSize });
  };

  const handlePageSizeChange = (value: any) => {
    dispatch({ type: "CHANGE_PAGE", page: 1, pageSize: parseInt(value) });
  };

  const handleVisitOrderChange = (e: any) => {
    const newSortOrder = e.target.value;
    dispatch({ type: "CHANGE_VISIT_FILTER", visitOrder: newSortOrder }); // You might want to use a different action type
    setVisitOrder(newSortOrder);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex w-full justify-between items-center gap-2.5">
        <Input
          placeholder="Enter Search "
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex gap-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 rounded-lg shadow-sm px-4 py-2"
            >
              <span>
                <FilterIcon size={16} />
              </span>
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white shadow-lg rounded-md border border-gray-200 mt-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="filter-options " className="border-none">
                <AccordionTrigger className="flex items-center gap-2.5 px-4 py-1.5 hover:bg-gray-50 cursor-pointer">
                  Type
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="flex flex-col px-4 py-2.5 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filter"
                        value="all"
                        checked={filter === "all"}
                        onChange={handleFilterChange}
                        className="mr-2"
                      />
                      All
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filter"
                        value="hot"
                        checked={filter === "hot"}
                        onChange={handleFilterChange}
                        className="mr-2"
                      />
                      Hot
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filter"
                        value="warm"
                        checked={filter === "warm"}
                        onChange={handleFilterChange}
                        className="mr-2"
                      />
                      Warm
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filter"
                        value="cold"
                        checked={filter === "cold"}
                        onChange={handleFilterChange}
                        className="mr-2"
                      />
                      Cold
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filter"
                        value="undefined"
                        checked={filter === "undefined"}
                        onChange={handleFilterChange}
                        className="mr-2"
                      />
                      Unknown
                    </label>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <DropdownMenuSeparator />

              <AccordionItem value="filter-visits" className="border-none">
                <AccordionTrigger className="flex items-center gap-2.5 px-4 py-1.5 hover:bg-gray-50 cursor-pointer">
                  Visit
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="flex flex-wrap px-4 py-2.5 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visitFilter"
                        value="desc"
                        checked={visitFilter === "desc"}
                        onChange={handleVisitOrderChange}
                        className="mr-2"
                      />
                      High to Low
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visitFilter"
                        value="asc"
                        checked={visitFilter === "asc"}
                        onChange={handleVisitOrderChange}
                        className="mr-2"
                      />
                      Low to High
                    </label>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        Total Leads: <span>{totalLeads}</span>
      </div>
      <div className=" flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm text-left font-semibold text-gray-900"
                    >
                      Phone Number
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-gray-900"
                    >
                      Type
                    </th>
                    {/* <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-gray-900"
                    >
                      Total Visits
                    </th> */}
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-gray-900"
                    >
                      Created At
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-center"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <>{loadingPlaceholder}</>
                  ) : !leads.length ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">
                        No Leads found
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead: any) => (
                      <tr key={lead.email}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {lead.first_name + " " + lead.last_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {lead.phone_number}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500 items-center flex w-full justify-center">
                          <StatusBadge type={lead.type} />
                        </td>
                        {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
                          {lead._count.VisitHistory}
                        </td> */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-6">
                          <Link
                            href={`leads/${lead.id}`}
                            className="bg-green-600 hover:bg-green-700 hover:shadow-sm border rounded-full px-5 py-2.5 text-white"
                          >
                            Open<span className="sr-only">, {lead.name}</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={leads.length}
        pageSize={pageSize}
        onPrevious={() => handlePageChange(currentPage - 1)}
        onNext={() => handlePageChange(currentPage + 1)}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

const StatusBadge = ({ type }: { type: any }) => {
  let colorClass = "";
  switch (type) {
    case "hot":
      colorClass = "bg-red-600";
      break;
    case "warm":
      colorClass = "bg-orange-600";
      break;
    case "cold":
      colorClass = "bg-blue-600";
      break;
    case "Cold":
      colorClass = "bg-blue-600";
      break;
    default:
      colorClass = "bg-gray-200 !text-black";
      break;
  }
  return (
    <div
      className={`font-medium  text-white ${colorClass} px-2 py-1 rounded-full text-center w-24`}
    >
      {type || "Unknown"}
    </div>
  );
};
