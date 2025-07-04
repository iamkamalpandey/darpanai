// File: components/TelecallerLeadsTable.tsx

import React, { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/services/api";
import { formatDate } from "@/lib/utils";

interface TelecallerLeadsTableProps {
  initialStatus?: string;
  showStatusFilter?: boolean;
  showTypeFilter?: boolean;
}

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
    <td className="px-3 py-4">
      <Skeleton className="h-8 w-24 mx-auto" />
    </td>
    <td className="px-3 py-4">
      <Skeleton className="h-8 w-24 mx-auto" />
    </td>
  </tr>
);

function leadsReducer(state: any, action: any) {
  switch (action.type) {
    case "FETCH_INIT":
      return { ...state, loading: true };
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
      return { ...state, currentPage: action.page, pageSize: action.pageSize };
    case "CHANGE_SEARCH_VALUE":
      return { ...state, searchValue: action.searchValue, currentPage: 1 };
    case "CHANGE_FILTER":
      return { ...state, filter: action.filter, currentPage: 1 };
    case "CHANGE_STATUS":
      return { ...state, status: action.status, currentPage: 1 };
    default:
      return state;
  }
}

export default function TelecallerLeadsTable({
  initialStatus = "incomplete",
  showStatusFilter = true,
  showTypeFilter = true,
}: TelecallerLeadsTableProps) {
  const [state, dispatch] = useReducer(leadsReducer, {
    leads: [],
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalLeads: 0,
    searchValue: "",
    filter: "all",
    status: initialStatus,
    loading: false,
  });

  const {
    leads,
    currentPage,
    totalPages,
    pageSize,
    totalLeads,
    searchValue,
    filter,
    status,
    loading,
  } = state;

  useEffect(() => {
    const fetchLeads = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const response = await api.get("telecaller/leads", {
          params: {
            page: currentPage,
            pageSize,
            searchValue,
            type: filter === "all" ? undefined : filter,
            status,
          },
        });
        dispatch({
          type: "FETCH_SUCCESS",
          payload: response.data.data,
        });
      } catch (error) {
        console.error("Failed to fetch leads:", error);
        dispatch({ type: "FETCH_INIT" });
      }
    };
    fetchLeads();
  }, [currentPage, pageSize, searchValue, filter, status]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: "CHANGE_STATUS", status: e.target.value });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    dispatch({ type: "CHANGE_PAGE", page, pageSize });
  };

  const handlePageSizeChange = (size: number) => {
    dispatch({ type: "CHANGE_PAGE", page: 1, pageSize: size });
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex w-full justify-between items-center gap-2.5">
        <Input
          placeholder="Search leads..."
          value={searchValue}
          onChange={(e) =>
            dispatch({
              type: "CHANGE_SEARCH_VALUE",
              searchValue: e.target.value,
            })
          }
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {showStatusFilter && (
            <select
              value={status}
              onChange={handleStatusChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="incomplete">Incomplete</option>
              <option value="followup">Follow-up</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          )}
        </div>
      </div>
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
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
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Phone Number
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Follow-up Date
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Total Visits
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
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
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead: any) => (
                <tr key={lead.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {lead.first_name} {lead.last_name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {lead.phone_number}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {lead.followUpDates[0]
                      ? formatDate(lead.followUpDates[0].date)
                      : "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {lead._count.VisitHistory}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-center">
                    <Link
                      href={`/telecaller/leads/edit/${lead.id}`}
                      className="border rounded-full px-10 py-2.5 bg-green-600 text-white"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalLeads}
        pageSize={pageSize}
        onPrevious={() => handlePageChange(currentPage - 1)}
        onNext={() => handlePageChange(currentPage + 1)}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
