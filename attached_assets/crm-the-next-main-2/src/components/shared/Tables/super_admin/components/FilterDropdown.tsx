import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterIcon, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

interface Country {
  id: number;
  name: string;
}

interface FilterDropdownProps {
  branches: { id: string | number; name: string }[];
  selectedBranch: string;
  handleBranchChange: (branchId: string) => void;
  localInstitution: string;
  setLocalInstitution: (value: string) => void;
  selectedCountries: number[];
  onCountriesChange: (countries: number[]) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  branches,
  selectedBranch,
  handleBranchChange,
  localInstitution,
  setLocalInstitution,
  selectedCountries = [],
  onCountriesChange,
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get("/countries");
        const data = await response.data;
        setCountries(data.data);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };
    fetchCountries();
  }, []);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const handleCountryToggle = (countryId: number) => {
    if (selectedCountries.includes(countryId)) {
      onCountriesChange(selectedCountries.filter((id) => id !== countryId));
    } else {
      onCountriesChange([...selectedCountries, countryId]);
    }
  };

  const handleSelectAllCountries = () => {
    if (selectedCountries.length === countries.length) {
      onCountriesChange([]);
    } else {
      onCountriesChange(countries.map((country) => country.id));
    }
  };

  const getSelectedCountriesText = () => {
    if (selectedCountries.length === 0) return "Select countries";
    if (selectedCountries.length === countries.length)
      return "All countries selected";
    return `${selectedCountries.length} countries selected`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-2.5">
          <FilterIcon size={16} />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-4">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="branch"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Branch
            </label>
            <select
              id="branch"
              value={selectedBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id.toString()}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="institution"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Local Institution
            </label>
            <Input
              id="institution"
              value={localInstitution}
              onChange={(e) => setLocalInstitution(e.target.value)}
              placeholder="Enter institution name"
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interested Countries
            </label>
            <DropdownMenu
              open={isCountryDropdownOpen}
              onOpenChange={setIsCountryDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  role="combobox"
                >
                  {getSelectedCountriesText()}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full p-0">
                <div className="p-2">
                  <Input
                    value={countrySearchTerm}
                    onChange={(e) => setCountrySearchTerm(e.target.value)}
                    placeholder="Search countries"
                    className="mb-2"
                  />
                  <div className="flex items-center gap-2 mb-2 w-full">
                    <Checkbox
                      id="selectAll"
                      checked={selectedCountries.length === countries.length}
                      onCheckedChange={handleSelectAllCountries}
                    />
                    <label htmlFor="selectAll" className="text-sm">
                      Select All
                    </label>
                  </div>
                  <ScrollArea className="h-48 w-full rounded-md border p-2">
                    <div className="space-y-2">
                      {filteredCountries.map((country) => (
                        <div
                          key={country.id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`country-${country.id}`}
                            checked={selectedCountries.includes(country.id)}
                            onCheckedChange={() =>
                              handleCountryToggle(country.id)
                            }
                          />
                          <label
                            htmlFor={`country-${country.id}`}
                            className="text-sm"
                          >
                            {country.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
