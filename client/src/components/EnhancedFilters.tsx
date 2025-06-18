import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Filter, X, ChevronDown, Calendar, FileText, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isAfter, isBefore, subDays, subMonths, subYears } from "date-fns";

export interface FilterOptions {
  searchTerm?: string;
  category?: string;
  country?: string;
  visaType?: string;
  userType?: string;
  status?: string;
  dateRange?: string;
  analysisType?: string;
  severity?: string;
  isPublic?: boolean | null;
}

interface FilterConfig {
  showSearch?: boolean;
  showCategory?: boolean;
  showCountry?: boolean;
  showVisaType?: boolean;
  showUserType?: boolean;
  showStatus?: boolean;
  showDateRange?: boolean;
  showAnalysisType?: boolean;
  showSeverity?: boolean;
  showPublicFilter?: boolean;
  customFilters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
}

interface EnhancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  config?: FilterConfig;
  dropdownOptions?: {
    countries?: string[];
    visaTypes?: string[];
    userTypes?: string[];
    categories?: string[];
  };
  resultCount?: number;
  className?: string;
  placeholder?: string;
}

const dateRangeOptions = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const analysisTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "visa_rejection", label: "Visa Rejection" },
  { value: "enrollment", label: "Enrollment" },
];

const severityOptions = [
  { value: "all", label: "All Severities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const publicFilterOptions = [
  { value: "all", label: "All" },
  { value: "public", label: "Public Only" },
  { value: "private", label: "Private Only" },
];

const defaultCategories = [
  { value: "all", label: "All Categories" },
  { value: "financial", label: "Financial" },
  { value: "academic", label: "Academic" },
  { value: "personal", label: "Personal" },
  { value: "employment", label: "Employment" },
  { value: "travel", label: "Travel" },
  { value: "legal", label: "Legal" },
  { value: "medical", label: "Medical" },
  { value: "insurance", label: "Insurance" },
  { value: "accommodation", label: "Accommodation" },
  { value: "language", label: "Language" },
  { value: "others", label: "Others" },
];

export function EnhancedFilters({
  filters,
  onFiltersChange,
  config = {},
  dropdownOptions = {},
  resultCount,
  className,
  placeholder = "Search..."
}: EnhancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState(filters.searchTerm || "");

  // Debounced search to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDebounce !== filters.searchTerm) {
        onFiltersChange({ ...filters, searchTerm: searchDebounce });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchDebounce]);

  // Memoized dropdown options to prevent unnecessary re-renders
  const countryOptions = useMemo(() => [
    { value: "all", label: "All Countries" },
    ...(dropdownOptions.countries || []).map(country => ({
      value: country,
      label: country
    }))
  ], [dropdownOptions.countries]);

  const visaTypeOptions = useMemo(() => [
    { value: "all", label: "All Visa Types" },
    ...(dropdownOptions.visaTypes || []).map(type => ({
      value: type,
      label: type
    }))
  ], [dropdownOptions.visaTypes]);

  const userTypeOptions = useMemo(() => [
    { value: "all", label: "All User Types" },
    ...(dropdownOptions.userTypes || []).map(type => ({
      value: type,
      label: type
    }))
  ], [dropdownOptions.userTypes]);

  const categoryOptions = useMemo(() => {
    if (dropdownOptions.categories?.length) {
      return [
        { value: "all", label: "All Categories" },
        ...dropdownOptions.categories.map(cat => ({
          value: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1)
        }))
      ];
    }
    return defaultCategories;
  }, [dropdownOptions.categories]);

  // Active filters count for UI feedback
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.category && filters.category !== "all") count++;
    if (filters.country && filters.country !== "all") count++;
    if (filters.visaType && filters.visaType !== "all") count++;
    if (filters.userType && filters.userType !== "all") count++;
    if (filters.status && filters.status !== "all") count++;
    if (filters.dateRange) count++;
    if (filters.analysisType && filters.analysisType !== "all") count++;
    if (filters.severity && filters.severity !== "all") count++;
    if (filters.isPublic !== null && filters.isPublic !== undefined) count++;
    return count;
  }, [filters]);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    // Convert "all" values to undefined to clear the filter
    const actualValue = value === "all" ? undefined : value;
    onFiltersChange({ ...filters, [key]: actualValue });
  };

  const clearAllFilters = () => {
    setSearchDebounce("");
    onFiltersChange({});
  };

  const clearSpecificFilter = (key: keyof FilterOptions) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    if (key === 'searchTerm') setSearchDebounce("");
    onFiltersChange(newFilters);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Search
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {resultCount !== undefined && (
              <Badge variant="outline" className="text-xs">
                {resultCount} results
              </Badge>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar - Always Visible */}
        {config?.showSearch !== false && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, filename..."
              value={searchDebounce}
              onChange={(e) => setSearchDebounce(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchDebounce && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchDebounce("");
                  clearSpecificFilter('searchTerm');
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Quick Filter Badges */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.searchTerm}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearSpecificFilter('searchTerm')}
                />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                Category: {filters.category}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearSpecificFilter('category')}
                />
              </Badge>
            )}
            {filters.country && (
              <Badge variant="secondary" className="gap-1">
                Country: {filters.country}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearSpecificFilter('country')}
                />
              </Badge>
            )}
            {filters.analysisType && (
              <Badge variant="secondary" className="gap-1">
                Type: {filters.analysisType === 'visa_rejection' ? 'Visa Rejection' : 'Enrollment'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearSpecificFilter('analysisType')}
                />
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Expanded Filters */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              
              {config.showCategory && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={filters.category || "all"}
                    onValueChange={(value) => updateFilter('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.showCountry && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Select
                    value={filters.country || "all"}
                    onValueChange={(value) => updateFilter('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.showVisaType && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visa Type</label>
                  <Select
                    value={filters.visaType || "all"}
                    onValueChange={(value) => updateFilter('visaType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visa type" />
                    </SelectTrigger>
                    <SelectContent>
                      {visaTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.showUserType && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">User Type</label>
                  <Select
                    value={filters.userType || "all"}
                    onValueChange={(value) => updateFilter('userType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.showStatus && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) => updateFilter('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.showDateRange && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select
                    value={filters.dateRange || "all"}
                    onValueChange={(value) => updateFilter('dateRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRangeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.showAnalysisType && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Analysis Type</label>
                  <Select
                    value={filters.analysisType || "all"}
                    onValueChange={(value) => updateFilter('analysisType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select analysis type" />
                    </SelectTrigger>
                    <SelectContent>
                      {analysisTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.showSeverity && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <Select
                    value={filters.severity || "all"}
                    onValueChange={(value) => updateFilter('severity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.showPublicFilter && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visibility</label>
                  <Select
                    value={filters.isPublic === null ? "all" : filters.isPublic ? "public" : "private"}
                    onValueChange={(value) => {
                      if (value === "all") {
                        updateFilter('isPublic', null);
                      } else {
                        updateFilter('isPublic', value === "public");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      {publicFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Custom Filters */}
              {config.customFilters?.map((customFilter) => (
                <div key={customFilter.key} className="space-y-2">
                  <label className="text-sm font-medium">{customFilter.label}</label>
                  <Select
                    value={(filters as any)[customFilter.key] || "all"}
                    onValueChange={(value) => updateFilter(customFilter.key as keyof FilterOptions, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${customFilter.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {customFilter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Utility function for filtering data based on date range
export function filterByDateRange(items: any[], dateField: string, dateRange: string) {
  if (!dateRange) return items;

  const now = new Date();
  let cutoffDate: Date;

  switch (dateRange) {
    case 'today':
      cutoffDate = subDays(now, 1);
      break;
    case 'week':
      cutoffDate = subDays(now, 7);
      break;
    case 'month':
      cutoffDate = subMonths(now, 1);
      break;
    case 'year':
      cutoffDate = subYears(now, 1);
      break;
    default:
      return items;
  }

  return items.filter(item => {
    try {
      const itemDate = parseISO(item[dateField]);
      return isAfter(itemDate, cutoffDate);
    } catch {
      return true; // Include items with invalid dates
    }
  });
}

// Utility function for comprehensive text search
export function searchInText(item: any, searchTerm: string, searchFields: string[]): boolean {
  if (!searchTerm) return true;
  
  const term = searchTerm.toLowerCase().trim();
  if (!term) return true;

  return searchFields.some(field => {
    const value = getNestedValue(item, field);
    return value && String(value).toLowerCase().includes(term);
  });
}

// Helper function to get nested object values safely
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}