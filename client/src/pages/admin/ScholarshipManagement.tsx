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
      if (filterCountry && filterCountry !== 'all') params.append('country', filterCountry);
      if (filterFundingType && filterFundingType !== 'all') params.append('fundingType', filterFundingType);
      if (filterDifficulty && filterDifficulty !== 'all') params.append('difficulty', filterDifficulty);
      params.append('limit', '20');
      params.append('offset', ((currentPage - 1) * 20).toString());
      
      const response = await fetch(`/api/admin/scholarships?${params}`);
      if (!response.ok) throw new Error('Failed to fetch scholarships');
      return response.json();
    }
  });

  // Fetch scholarship statistics
  const { data: statsData } = useQuery({
    queryKey: ['scholarship-stats'],
    queryFn: async () => {
      const response = await fetch('/api/scholarships/stats/overview');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
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
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scholarship Management</h1>
              <p className="text-gray-600">Comprehensive database-driven scholarship system</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setLocation('/admin/scholarships/create')} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Scholarship
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
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Data'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Scholarships</p>
                    <p className="text-2xl font-bold">{statsData?.data?.totalScholarships || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Providers</p>
                    <p className="text-2xl font-bold">{statsData?.data?.totalProviders || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Globe className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Countries Covered</p>
                    <p className="text-2xl font-bold">{statsData?.data?.totalCountries || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Funding</p>
                    <p className="text-2xl font-bold">{statsData?.data?.totalFunding || '$0M+'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search scholarships, providers, or countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            {(filterStatus !== 'all' || filterProviderType !== 'all' || filterCountry !== 'all' || filterFundingType !== 'all' || filterDifficulty !== 'all' || searchTerm) && (
              <Button variant="ghost" onClick={clearAllFilters} className="text-red-600">
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
            <Badge variant="outline" className="px-3 py-1">
              {scholarships.length} of {totalScholarships} scholarships
            </Badge>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="grid grid-cols-5 gap-4">
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
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="institution">Institution</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                    <SelectItem value="full">Full Scholarship</SelectItem>
                    <SelectItem value="partial">Partial Funding</SelectItem>
                    <SelectItem value="tuition-only">Tuition Only</SelectItem>
                    <SelectItem value="living-allowance">Living Allowance</SelectItem>
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
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="very-hard">Very Hard</SelectItem>
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
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Table */}
        <div className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scholarship Database</CardTitle>
                  <CardDescription>Complete database of international scholarship opportunities</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setLocation('/admin/scholarships/bulk-edit')}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Bulk Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Quick Export
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scholarship Name</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Funding</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scholarships.map((scholarship: Scholarship) => (
                        <TableRow key={scholarship.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium max-w-xs">
                            <div className="break-words overflow-hidden text-wrap">
                              {scholarship.name}
                            </div>
                            {scholarship.shortName && (
                              <div className="text-sm text-gray-500">{scholarship.shortName}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="break-words overflow-hidden text-wrap">
                              {scholarship.providerName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {scholarship.providerType}
                            </Badge>
                          </TableCell>
                          <TableCell>{scholarship.providerCountry}</TableCell>
                          <TableCell>
                            <Badge variant={scholarship.fundingType === 'full' ? 'default' : 'secondary'}>
                              {scholarship.fundingType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {scholarship.applicationDeadline ? 
                              new Date(scholarship.applicationDeadline).toLocaleDateString() : 
                              'Not specified'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={scholarship.status === 'active' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {scholarship.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
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
                                onClick={() => setLocation(`/admin/scholarships/edit/${scholarship.id}`)}
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