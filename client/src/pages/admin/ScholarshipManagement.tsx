import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Search, Filter, Eye, Download, Upload, X, Database, Users, Globe, DollarSign, ChevronDown, FileSpreadsheet, FileDown } from "lucide-react";
import { useLocation } from "wouter";
import type { Scholarship } from "@shared/scholarshipSchema";

export default function ScholarshipManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProviderType, setFilterProviderType] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterFundingType, setFilterFundingType] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch scholarships with pagination and filtering
  const { data: scholarshipsData, isLoading } = useQuery({
    queryKey: ['admin-scholarships', searchTerm, filterStatus, filterProviderType, filterCountry, filterFundingType, filterDifficulty, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);
      if (filterProviderType && filterProviderType !== 'all') params.append('providerType', filterProviderType);
      if (filterCountry && filterCountry !== 'all') params.append('providerCountry', filterCountry); // Fixed parameter name
      if (filterFundingType && filterFundingType !== 'all') params.append('fundingType', filterFundingType);
      if (filterDifficulty && filterDifficulty !== 'all') params.append('difficultyLevel', filterDifficulty); // Fixed parameter name
      params.append('limit', '20');
      params.append('offset', ((currentPage - 1) * 20).toString());
      
      const response = await fetch(`/api/admin/scholarships?${params}`);
      if (!response.ok) throw new Error('Failed to fetch scholarships');
      return response.json();
    },
    staleTime: 30000, // Cache for 30 seconds to prevent constant refetching
    refetchOnWindowFocus: false // Prevent refetch on window focus
  });

  // Fetch scholarship statistics
  const { data: statsData } = useQuery({
    queryKey: ['scholarship-stats'],
    queryFn: async () => {
      const response = await fetch('/api/scholarships/stats/overview');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false
  });

  // Fetch filter options from database
  const { data: filterOptions } = useQuery({
    queryKey: ['scholarship-filter-options'],
    queryFn: async () => {
      const response = await fetch('/api/scholarships/filter-options');
      if (!response.ok) throw new Error('Failed to fetch filter options');
      return response.json();
    },
    staleTime: 600000, // Cache for 10 minutes
    refetchOnWindowFocus: false
  });

  // Delete scholarship mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/scholarships/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
      toast({
        title: "Success",
        description: "Scholarship deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete scholarship",
        variant: "destructive"
      });
    }
  });

  // Import data function
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/scholarships/import', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Import failed');
      
      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
      queryClient.invalidateQueries({ queryKey: ['scholarship-stats'] });
      
      toast({
        title: "Success",
        description: `Successfully imported ${result.imported} scholarships`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import data",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      if (event.target) event.target.value = '';
    }
  };

  // Export data function
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/admin/scholarships/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scholarships-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Scholarship data exported successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Download sample CSV template
  const handleDownloadSample = async () => {
    try {
      const response = await fetch('/api/admin/scholarships/sample-csv');
      if (!response.ok) throw new Error('Failed to download sample');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scholarship-import-template-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Sample CSV template downloaded successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download sample",
        variant: "destructive"
      });
    }
  };

  const scholarships = scholarshipsData?.data?.scholarships || [];
  const totalScholarships = scholarshipsData?.data?.total || 0;
  const totalPages = Math.ceil(totalScholarships / 20);

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this scholarship?')) {
      deleteMutation.mutate(id);
    }
  };

  const clearAllFilters = () => {
    setFilterStatus("all");
    setFilterProviderType("all");
    setFilterCountry("all");
    setFilterFundingType("all");
    setFilterDifficulty("all");
    setSearchTerm("");
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">Scholarship Management</h1>
              <p className="text-sm sm:text-base text-gray-600 break-words">Comprehensive database-driven scholarship system</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button 
                onClick={() => setLocation('/admin/scholarships/create')} 
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="break-words">Create Scholarship</span>
              </Button>
              <input
                type="file"
                accept=".csv,.xlsx,.json"
                onChange={handleImport}
                className="hidden"
                id="import-input"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('import-input')?.click()}
                disabled={isImporting}
                className="w-full sm:w-auto"
              >
                <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="break-words">{isImporting ? 'Importing...' : 'Import Data'}</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="break-words">{isExporting ? 'Exporting...' : 'Export Data'}</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-blue-500 flex-shrink-0" />
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600 break-words">Total Scholarships</p>
                    <p className="text-2xl font-bold break-words">{statsData?.data?.totalScholarships || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-500 flex-shrink-0" />
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600 break-words">Total Providers</p>
                    <p className="text-2xl font-bold break-words">{statsData?.data?.totalProviders || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Globe className="h-8 w-8 text-purple-500 flex-shrink-0" />
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600 break-words">Countries Covered</p>
                    <p className="text-2xl font-bold break-words">{statsData?.data?.totalCountries || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex-shrink-0" />
                <Input
                  placeholder="Search scholarships..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Filter className="w-4 h-4 flex-shrink-0" />
                <span className="break-words">Filters</span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              {(filterStatus !== 'all' || filterProviderType !== 'all' || filterCountry !== 'all' || filterFundingType !== 'all' || filterDifficulty !== 'all' || searchTerm) && (
                <Button variant="ghost" onClick={clearAllFilters} className="text-red-600 w-full sm:w-auto">
                  <X className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="break-words">Clear Filters</span>
                </Button>
              )}
              <Badge variant="outline" className="px-3 py-1 text-center break-words overflow-hidden">
                {isLoading ? 'Loading...' : `${scholarships.length} of ${totalScholarships}`}
              </Badge>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Provider Type</label>
                <Select value={filterProviderType} onValueChange={setFilterProviderType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {filterOptions?.data?.providerTypes?.map((type: string) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Funding Type</label>
                <Select value={filterFundingType} onValueChange={setFilterFundingType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Funding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Funding</SelectItem>
                    {filterOptions?.data?.fundingTypes?.map((type: string) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty</label>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {filterOptions?.data?.difficultyLevels?.map((level: string) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Country</label>
                <Select value={filterCountry} onValueChange={setFilterCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {filterOptions?.data?.countries?.map((country: any) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} {country.currencySymbol ? `(${country.currencySymbol})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Table */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="break-words">Scholarship Database</CardTitle>
                  <CardDescription className="break-words">Complete database of international scholarship opportunities</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setLocation('/admin/scholarships/bulk-edit')} className="w-full sm:w-auto">
                    <FileSpreadsheet className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="break-words">Bulk Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto">
                    <FileDown className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="break-words">Quick Export</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading scholarships...</p>
                  </div>
                </div>
              ) : scholarships.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search criteria or add new scholarships.</p>
                  <Button onClick={() => setLocation('/admin/scholarships/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Scholarship
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Scholarship Name</TableHead>
                          <TableHead className="min-w-[150px]">Provider</TableHead>
                          <TableHead className="min-w-[100px]">Type</TableHead>
                          <TableHead className="min-w-[80px]">Country</TableHead>
                          <TableHead className="min-w-[100px]">Funding</TableHead>
                          <TableHead className="min-w-[120px]">Deadline</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {scholarships.map((scholarship: Scholarship) => (
                        <TableRow key={scholarship.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="min-w-0 break-words overflow-hidden text-wrap">
                              {scholarship.name}
                            </div>
                            {scholarship.shortName && (
                              <div className="text-sm text-gray-500 break-words">{scholarship.shortName}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0 break-words overflow-hidden text-wrap">
                              {scholarship.providerName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize whitespace-nowrap">
                              {scholarship.providerType}
                            </Badge>
                          </TableCell>
                          <TableCell className="break-words">{scholarship.providerCountry}</TableCell>
                          <TableCell>
                            <Badge variant={scholarship.fundingType === 'full' ? 'default' : 'secondary'} className="whitespace-nowrap">
                              {scholarship.fundingType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 break-words">
                            {scholarship.applicationDeadline ? 
                              new Date(scholarship.applicationDeadline).toLocaleDateString() : 
                              'Not specified'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={scholarship.status === 'active' ? 'default' : 'secondary'}
                              className="capitalize whitespace-nowrap"
                            >
                              {scholarship.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLocation(`/admin/scholarship-details/${scholarship.id}`)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLocation(`/admin/scholarship/edit/${scholarship.id}`)}
                                title="Edit Scholarship"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(scholarship.id)}
                                disabled={deleteMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete Scholarship"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, totalScholarships)} of {totalScholarships} scholarships
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600 px-3">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}