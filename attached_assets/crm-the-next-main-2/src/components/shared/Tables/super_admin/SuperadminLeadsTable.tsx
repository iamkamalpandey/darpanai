import api from "@/services/api";
import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Pagination from "@/components/ui/pagination";

import React from "react";
import { X, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "../../StatusBadge";
import { StageBadge } from "./components/StageBadge";
import { ArchiveBadge } from "./components/ArchiveBadge";
import { LoadingPlaceholder } from "./components/LoadingPlaceholder";
import FilterDropdown from "./components/FilterDropdown";
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

    case "TOGGLE_SELECT_ALL":
      return {
        ...state,
        selectedLeads: action.payload ? state.leads.map((lead) => lead.id) : [],
      };
    case "TOGGLE_SELECT_LEAD":
      return {
        ...state,
        selectedLeads: action.payload.isSelected
          ? [...state.selectedLeads, action.payload.leadId]
          : state.selectedLeads.filter((id) => id !== action.payload.leadId),
      };
    case "CHANGE_BRANCH":
      return {
        ...state,
        selectedBranch: action.branch,
        selectedBranchName: action.branchName,
      };
    case "CHANGE_COUNTRIES":
      return {
        ...state,
        selectedCountries: action.countries,
      };
    default:
      return state;
  }
}

export default function SuperAdminLeadsTable() {
  const [state, dispatch] = useReducer(leadsReducer, {
    leads: [],
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalLeads: 0,

    selectedLeads: [],
    selectedBranch: null,
    selectedBranchName: "",
    selectedCountries: [],
  });

  const {
    leads,
    currentPage,
    totalPages,
    totalLeads,
    pageSize,
    searchValue,
    loading,

    selectedLeads,
    selectedBranch,
  } = state;
  const [filter, setFilter] = useState("all");
  const [selectedCountries, setSelectedCountries] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [localInstitution, setLocalInstitution] = useState("");
  const [debouncedInstitution, setDebouncedInstitution] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInstitution(localInstitution);
    }, 500);

    return () => clearTimeout(timer);
  }, [localInstitution]);
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(localSearch);
    }, 500);

    return () => clearTimeout(timerId);
  }, [localSearch]);

  useEffect(() => {
    dispatch({ type: "CHANGE_SEARCH_VALUE", searchValue: debouncedSearch });
  }, [debouncedSearch]);

  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get("branch");
        setBranches(response.data.data);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const response = await api.get("manager/leads", {
          params: {
            page: currentPage,
            pageSize,
            searchValue,

            type: filter === "all" ? undefined : filter,
            branchId: selectedBranch,
            educationLevel,
            institution: debouncedInstitution,
            startDate,
            endDate,
            countries:
              selectedCountries.length > 0
                ? JSON.stringify(selectedCountries)
                : undefined,
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
  }, [
    currentPage,
    pageSize,
    searchValue,
    filter,
    selectedCountries,
    selectedBranch,
    educationLevel,
    debouncedInstitution,
    startDate,
    endDate,
  ]);
  const handlePageChange = (page: any) => {
    if (page < 1 || page > totalPages) return;
    dispatch({ type: "CHANGE_PAGE", page, pageSize });
  };

  const handlePageSizeChange = (value: any) => {
    dispatch({ type: "CHANGE_PAGE", page: 1, pageSize: parseInt(value) });
  };

  const handleSelectAll = (e: any) => {
    dispatch({ type: "TOGGLE_SELECT_ALL", payload: e.target.checked });
  };

  const handleSelectLead = (leadId: any, isSelected: any) => {
    dispatch({ type: "TOGGLE_SELECT_LEAD", payload: { leadId, isSelected } });
  };

  const handleSendEmail = () => {
    setIsEmailDialogOpen(false);
  };
  const handleBranchChange = (branchId: any) => {
    const selectedBranchObj: any = branches.find(
      (branch: any) => branch.id.toString() === branchId
    );
    dispatch({
      type: "CHANGE_BRANCH",
      branch: branchId,
      branchName: selectedBranchObj ? selectedBranchObj.name : "",
    });
  };
  const handleCountriesChange = (countries: number[]) => {
    setSelectedCountries(countries);
    dispatch({ type: "CHANGE_COUNTRIES", countries });
  };

  const handleDownload = async () => {
    try {
      const response = await api.get("download", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `leads-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download leads:", error);
    }
  };
  const handleFilterChange = (newFilter: any) => {
    dispatch({ type: "CHANGE_FILTER", filter: newFilter });
  };

  const clearFilter = (filterType: any) => {
    switch (filterType) {
      case "type":
        handleFilterChange("all");
        break;

      case "branch":
        dispatch({
          type: "CHANGE_BRANCH",
          branch: null,
          branchName: "",
        });
        break;
    }
  };
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex w-full justify-between items-center gap-2.5">
        <Input
          placeholder="Enter Search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
          <span>to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="flex gap-2 items-center"
        >
          <Download size={16} />
          Download All
        </Button>
        <FilterDropdown
          branches={branches}
          selectedBranch={selectedBranch}
          handleBranchChange={handleBranchChange}
          localInstitution={localInstitution}
          setLocalInstitution={setLocalInstitution}
          selectedCountries={selectedCountries}
          onCountriesChange={handleCountriesChange}
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {filter !== "all" && (
          <div className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center">
            Type: {filter}
            <button
              onClick={() => clearFilter("type")}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {localInstitution && (
          <div className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center">
            Institution: {localInstitution}
            <button
              onClick={() => setLocalInstitution("")}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {selectedBranch && (
          <div className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center">
            Branch: {state.selectedBranchName}
            <button
              onClick={() => clearFilter("branch")}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      <div>
        Total Leads: <span>{totalLeads}</span>
      </div>
      {selectedLeads.length > 0 ? (
        <Button
          onClick={() => setIsEmailDialogOpen(true)}
          disabled={selectedLeads.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Compose Email ({selectedLeads.length})
        </Button>
      ) : (
        <></>
      )}

      <div className=" flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="relative px-6 py-3">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedLeads.length === leads.length}
                        onChange={handleSelectAll}
                      />
                    </th>
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
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-gray-900"
                    >
                      Stage
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
                    <>{LoadingPlaceholder}</>
                  ) : !leads.length ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">
                        No Leads found
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead: any) => (
                      <tr key={lead.email}>
                        <td className="relative px-6 py-4">
                          <input
                            type="checkbox"
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={(e) =>
                              handleSelectLead(lead.id, e.target.checked)
                            }
                          />
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {lead.first_name + " " + lead.last_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {lead.phone_number}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500 items-center flex w-full justify-center">
                          <StatusBadge type={lead.type} />
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <div className="flex justify-center">
                            <ArchiveBadge isArchived={lead.isArchived} />
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <div className="flex justify-center">
                            <StageBadge
                              counsellorStatus={lead.counsellor_status}
                              profileStatus={lead.profile_status}
                            />
                          </div>
                        </td>
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

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
            <DialogDescription>
              Send an email to {selectedLeads.length} selected lead(s).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="body" className="text-right">
                Body
              </Label>
              <Textarea
                id="body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="col-span-3"
                rows={5}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSendEmail}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Send Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
