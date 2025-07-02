import React, { useEffect, useReducer, useState } from "react";
import api from "@/services/api";
import Link from "next/link";

import { formatDate } from "@/lib/utils";
import Pagination from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const loadingPlaceholder = (
  <tr>
    <td colSpan={6} className="text-center">
      <Skeleton className="h-8 w-full" />
    </td>
  </tr>
);

function counsellorsReducer(state: any, action: any) {
  switch (action.type) {
    case "FETCH_INIT":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        counsellors: action.payload.counsellors,
        totalPages: action.payload.totalPages,
        pageSize: action.payload.pageSize,
        sortOrder: action.payload.sortOrder,
        loading: false,
      };
    case "CHANGE_SEARCH_VALUE":
      return {
        ...state,
        searchValue: action.searchValue,
        currentPage: 1, // Reset to first page when searching
      };
    case "CHANGE_PAGE":
      return { ...state, currentPage: action.page, pageSize: action.pageSize };
    case "CHANGE_SORT_ORDER":
      return {
        ...state,
        sortOrder: action.sortOrder,
        currentPage: 1, // Reset to first page when changing sort order
      };
    default:
      return state;
  }
}

function CounsellorsTable() {
  const initialState = {
    counsellors: [],
    loading: false,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    sortOrder: "desc" as "asc" | "desc",
  };
  const [state, dispatch] = useReducer(counsellorsReducer, initialState);
  const {
    counsellors,
    currentPage,
    totalPages,
    loading,
    searchValue,
    pageSize,
    sortOrder,
  } = state;

  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  useEffect(() => {
    const timerId = setTimeout(() => {
      dispatch({ type: "CHANGE_SEARCH_VALUE", searchValue: debouncedSearch });
    }, 300);
    return () => clearTimeout(timerId);
  }, [debouncedSearch]);
  useEffect(() => {
    const fetchCounsellors = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const response = await api.get(`/manager/counsellors`, {
          params: {
            page: currentPage,
            pageSize: pageSize,
            searchValue,
            sortOrder,
          },
        });
        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            counsellors: response.data.data.counsellors,
            totalPages: response.data.data.totalPages,
            pageSize: response.data.data.pageSize,
            currentPage: response.data.data.currentPage,
            sortOrder: response.data.data.sortOrder,
          },
        });
      } catch (error) {
        console.error("Failed to fetch counsellors:", error);
        // Potentially handle error state here
      }
    };

    fetchCounsellors();
  }, [currentPage, searchValue, pageSize, sortOrder]);

  const handlePageChange = (newPage: any) => {
    dispatch({ type: "CHANGE_PAGE", page: newPage });
  };
  const handlePageSizeChange = (value: any) => {
    dispatch({ type: "CHANGE_PAGE", page: 1, pageSize: parseInt(value) });
  };
  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: "CHANGE_SORT_ORDER",
      sortOrder: e.target.value as "asc" | "desc",
    });
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search Counsellors"
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
        />
        <div className="flex flex-col w-full max-w-fit items-center">
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={handleSortOrderChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="asc">Least Assigned Leads</option>
            <option value="desc">Most Assigned Leads</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                Counsellor Name
              </th>
              <th
                scope="col"
                className="px-6 py-3  text-sm font-semibold text-center text-gray-900"
              >
                Assigned
              </th>
              <th
                scope="col"
                className="px-6 py-3  text-sm font-semibold text-center text-gray-900"
              >
                Hot
              </th>
              <th
                scope="col"
                className="px-6 py-3  text-sm font-semibold text-center text-gray-900"
              >
                Warm
              </th>
              <th
                scope="col"
                className="px-6 py-3  text-sm font-semibold text-center text-gray-900"
              >
                Cold
              </th>

              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                Created At
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading
              ? loadingPlaceholder
              : counsellors.map((counsellor: any) => (
                  <tr key={counsellor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-full bg-slate-100 text-center align-middle items-center grid">
                          {`${counsellor.name[0].toUpperCase()}`}
                        </div>
                        <div className=" flex flex-col">
                          <div className="text-left font-medium">
                            {counsellor.name}
                          </div>
                          <div className="text-sm text-slate-600">
                            {counsellor.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                      {counsellor.assignedLeads.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                      {counsellor.leadCounts.hot}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                      {counsellor.leadCounts.warm}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                      {counsellor.leadCounts.cold}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(counsellor.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        className="border rounded-full px-10 py-2.5 bg-green-600 text-white"
                        href={`counsellors/${counsellor.id}`}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={0}
        pageSize={0}
        onPrevious={() => handlePageChange(currentPage - 1)}
        onNext={() => handlePageChange(currentPage + 1)}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

export default CounsellorsTable;
