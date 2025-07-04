import api from "@/services/api";
import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { BiExport } from "react-icons/bi";
import Pagination from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
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

    default:
      return state;
  }
}

export default function CounsellorsLeadsTable({ userId }: { userId?: string }) {
  const handleExport = () => {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Phone Number",
      "Gender",
      "Address",
      "DOB",
      "Email",
      "Interested Course",
      "Field of Study",
      "SLC Institution",
      "SLC Grade",
      "SLC Year",
      "Highschool Institution",
      "Highschool Grade",
      "Highschool Year",
      "Bachelors Institution",
      "Bachelors Grade",
      "Bachelors Year",
      "Masters Institution",
      "Masters Grade",
      "Masters Year",
      "IELTS Overall",
      "IELTS Listening",
      "IELTS Speaking",
      "IELTS Reading",
      "IELTS Writing",
      "Profile Status",
      "Created At",
      "Updated At",
      "IELTS Date",
      "PTE Date",
      "PTE Listening",
      "PTE Overall",
      "PTE Reading",
      "PTE Speaking",
      "PTE Writing",
      "SAT Date",
      "SAT Math",
      "SAT Overall",
      "SAT Reading",
      "SAT Writing and Language",
      "Source",
      "Application Status",
      "Type",
      "City",
      "Counsellor Status",
      "Assigned Users",
      "Remarks",
      "Visit History Count",
      "Activity Log Count",
    ];

    const csvContent = [
      headers.join(","),
      ...leads.map((lead) =>
        [
          lead.id,
          lead.first_name,
          lead.last_name,
          lead.phone_number,
          lead.gender,
          lead.address,
          formatDate(lead.dob),
          lead.email,
          lead.interested_course,
          lead.field_of_study,
          lead.slc_institution_name,
          lead.slc_grade,
          lead.slc_year,
          lead.highschool_institution_name,
          lead.highschool_grade,
          lead.highschool_year,
          lead.bachelors_institution_name,
          lead.bachelors_grade,
          lead.bachelors_year,
          lead.masters_institution_name,
          lead.masters_grade,
          lead.masters_year,
          lead.ielts_overall_score,
          lead.ielts_listening_score,
          lead.ielts_speaking_score,
          lead.ielts_reading_score,
          lead.ielts_writing_score,
          lead.profile_status,
          formatDate(lead.createdAt),
          formatDate(lead.updatedAt),
          lead.ielts_date,
          lead.pte_date,
          lead.pte_listening_score,
          lead.pte_overall_score,
          lead.pte_reading_score,
          lead.pte_speaking_score,
          lead.pte_writing_score,
          lead.sat_date,
          lead.sat_math_score,
          lead.sat_overall_score,
          lead.sat_reading_score,
          lead.sat_writing_and_language_score,
          lead.source,
          lead.application_status,
          lead.type,
          lead.city,
          lead.counsellor_status,
          lead.assignedUsers.map((user: any) => user.userId).join(";"),
          lead.remarks.map((remark: any) => remark.content).join(";"),
          lead._count.VisitHistory,
          lead._count.ActivityLog,
        ]
          .map((field) => `"${field ?? ""}"`)
          .join(",")
      ),
    ].join("\n");

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a link element and trigger the download
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "leads_export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const [state, dispatch] = useReducer(leadsReducer, {
    leads: [],
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  const { leads, currentPage, totalPages, pageSize, searchValue, loading } =
    state;
  const [filter, setFilter] = useState("all");
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
        const response = await api.get("counsellor/leads", {
          params: {
            page: currentPage,
            pageSize,
            searchValue,
            type: filter === "all" ? undefined : filter,
            counsellor_status: false,
            ...(userId && { userId }),
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
          },
        });
      } catch (error) {
        console.error("Failed to fetch leads:", error);
        dispatch({ type: "FETCH_INIT" }); // Keep loading false on error
      }
    };
    fetchLeads();
  }, [currentPage, pageSize, searchValue, filter]);
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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

  return (
    <div className="flex flex-col gap-2.5">
      <div></div>
      <div className="flex w-full justify-between items-center gap-2.5">
        <Input
          placeholder="Enter Search "
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
        />
        <div className="flex flex-col w-full max-w-fit items-center">
          <select
            id="filter"
            value={filter}
            onChange={handleFilterChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <Button
          className="flex gap-2.5"
          variant={"outline"}
          onClick={handleExport}
        >
          <span>
            <BiExport />
          </span>
          Export
        </Button>
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
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-gray-900"
                    >
                      Total Visits
                    </th>
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
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
                          {lead._count.VisitHistory}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
                          {lead && formatDate(lead?.createdAt)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-6">
                          <Link
                            href={`/manager/leads/${lead.id}`}
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
