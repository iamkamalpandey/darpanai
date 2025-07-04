import React, { useCallback, useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/services/api";
import { formatDate } from "@/lib/utils";
import { CalendarX } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import debounce from "lodash/debounce";

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  type: string;
  profile_status: string;
  isArchived: boolean;
  createdAt: string;
  _count: {
    VisitHistory: number;
  };
  followUpDates: Array<{
    date: string;
  }>;
}

interface State {
  leads: Lead[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalLeads: number;
  searchValue: string;
  filter: string;
  status: string;
  loading: boolean;
}

type Action =
  | { type: "FETCH_INIT" }
  | { type: "FETCH_SUCCESS"; payload: any }
  | { type: "CHANGE_PAGE"; page: number; pageSize: number }
  | { type: "CHANGE_SEARCH_VALUE"; searchValue: string }
  | { type: "CHANGE_FILTER"; filter: string }
  | { type: "CHANGE_STATUS"; status: string };

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

function leadsReducer(state: State, action: Action): State {
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
  }
}

interface CounsellorLeadsTableProps {
  initialStatus?: string;
}

export default function AdmissionFollowersTable({
  initialStatus = "followers",
}: CounsellorLeadsTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
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

  const [activeTab, setActiveTab] = useState<"all" | "missed">("all");

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
        const response = await api.get("counsellor/leads", {
          params: {
            page: currentPage,
            pageSize,
            searchValue,
            type: filter === "all" ? undefined : filter,
            status,
            missed:
              status === "followup" && activeTab === "missed"
                ? true
                : undefined,
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
  }, [currentPage, pageSize, searchValue, filter, status, activeTab]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    dispatch({ type: "CHANGE_PAGE", page, pageSize });
  };

  const handlePageSizeChange = (size: number) => {
    dispatch({ type: "CHANGE_PAGE", page: 1, pageSize: size });
  };

  const renderLeadRow = (lead: Lead) => {
    const isFollowup = status === "followup";
    const isArchived = status === "archived";
    const followupDate =
      isFollowup && lead.followUpDates[0]
        ? new Date(lead.followUpDates[0].date)
        : null;
    const isMissed = isFollowup && followupDate && followupDate < new Date();

    return (
      <tr key={lead.id}>
        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
          {lead.first_name} {lead.last_name}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {lead.phone_number}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
          <StatusBadge type={lead.type} />
        </td>
        {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
          {lead.assignedUsers.find((u) => u.userId === user.id)?.createdAt
            ? formatDate(
                lead.assignedUsers.find((u) => u.userId === user.id).createdAt
              )
            : "N/A"}
        </td> */}
        {isFollowup && (
          <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
            {followupDate ? formatDate(followupDate.toISOString()) : "N/A"}
          </td>
        )}
        {isFollowup && (
          <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
            {isMissed && <CalendarX className="inline-block text-red-500" />}
          </td>
        )}
        <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
          {formatDate(lead.createdAt)}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
          {lead._count.VisitHistory}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
          <Link
            href={`/admission/leads/${lead.id}`}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Open
          </Link>
          {isArchived && (
            <button
              className="text-white hover:bg-green-700 rounded-full border px-2.5 py-2.5 bg-green-600"
              onClick={() => {
                setSelectedLead(lead);
                setModalOpen(true);
              }}
            >
              Unarchive
            </button>
          )}
        </td>
      </tr>
    );
  };
  const unarchiveLead = () => {
    if (selectedLead) {
      api.delete(`archive/${selectedLead.id}`).then((response) => {
        if (response.status == 200) {
          toast.success("Lead unarchived successfully!");
          // router.reload();
        }
      });
      setModalOpen(false);
    }
  };
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  // Debounced search dispatch
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      dispatch({ type: "CHANGE_SEARCH_VALUE", searchValue: value });
    }, 500),
    []
  );

  // Handle input change
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value); // Update the input value immediately
    debouncedSearch(value); // Debounce the actual search dispatch
  };
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search leads..."
          value={inputValue} // Use the immediate input value
          onChange={handleSearchInput} // Use the new handler
          className="max-w-xs"
        />
      </div>
      {status === "followup" && (
        <div className="mb-4">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
            className="mr-2"
          >
            All Follow-ups
          </Button>
          <Button
            variant={activeTab === "missed" ? "default" : "outline"}
            onClick={() => setActiveTab("missed")}
          >
            Missed Follow-ups
          </Button>
        </div>
      )}
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
                className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
              >
                Type
              </th>
              {/* <th
                scope="col"
                className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
              >
                Assigned Date
              </th> */}
              {status === "followup" && (
                <>
                  <th
                    scope="col"
                    className="px-3 py-3.5  text-sm font-semibold text-gray-900 text-center"
                  >
                    Follow-up Date
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                  >
                    Missed
                  </th>
                </>
              )}
              <th
                scope="col"
                className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
              >
                Created At
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
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
                  No Followers found
                </td>
              </tr>
            ) : (
              leads.map(renderLeadRow)
            )}
          </tbody>
        </table>
      </div>

      {selectedLead && modalOpen && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Unarchive Lead
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to unarchive this lead?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => unarchiveLead()}
                >
                  Unarchive
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
