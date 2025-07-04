// components/SearchLeads.tsx
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";
import debounce from "lodash/debounce";

interface SearchLeadsProps {
  userId: string;
  role: string;
}

export default function SearchLeads({ userId, role }: SearchLeadsProps) {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchLeads = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      let endpoint = "counsellor/leads";

      const response = await api.get(endpoint, {
        params: {
          searchValue: query,
          userId: userId,
          page: 1,
          pageSize: 5,
        },
      });
      setSearchResults(response.data.data.leads);
    } catch (error) {
      console.error("Error searching leads:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchLeads, 300), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleLeadClick = (leadId: number) => {
    let route = "";
    switch (role) {
      case "telecaller":
        route = `/telecaller/leads/edit/${leadId}`;
        break;
      case "counsellor":
        route = `/counsellor/leads/${leadId}`;
        break;
      case "super_admin":
        route = `/super_admin/leads/${leadId}`;
        break;
      case "admission":
        route = `/admission/leads/${leadId}`;
        break;

      default:
        route = `leads/${leadId}`;
    }
    router.push(route);
    setSearchResults([]);
  };

  return (
    <div className="flex-1 max-w-xl mx-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search leads..."
          onChange={handleSearchChange}
          className="w-full pl-10"
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
            {searchResults.map((lead: any) => (
              <div
                key={lead.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleLeadClick(lead.id)}
              >
                <div className="flex justify-between items-center">
                  <span>
                    {lead.first_name} {lead.last_name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {lead.phone_number}
                  </span>
                </div>
                <div className="mt-1">
                  {lead.profile_status === "incomplete" &&
                    lead.followUpDates &&
                    lead.followUpDates.length > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Follow-up
                      </span>
                    )}
                  {lead.isArchived && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Archived
                    </span>
                  )}
                  {lead.profile_status === "incomplete" &&
                    (!lead.followUpDates ||
                      lead.followUpDates.length === 0) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Lead
                      </span>
                    )}
                  {lead.profile_status === "complete" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
