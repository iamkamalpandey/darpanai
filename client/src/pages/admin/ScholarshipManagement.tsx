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
import { Plus, Edit, Trash2, Search, Filter, Eye, Download, Upload, ChevronDown, ChevronUp, Database, Users, Globe, DollarSign, Calendar, BookOpen } from "lucide-react";
import { useLocation } from "wouter";
import type { Scholarship } from "@shared/scholarshipSchema";

// Stats card component
interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: string;
}

function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
}

export default function ScholarshipManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProviderType, setFilterProviderType] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterFundingType, setFilterFundingType] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
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

  const scholarships = scholarshipsData?.data?.scholarships || [];
  const totalScholarships = scholarshipsData?.data?.total || 0;
  const totalPages = Math.ceil(totalScholarships / 20);

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this scholarship?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Scholarship Management
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Comprehensive database-driven scholarship system with advanced filtering and management capabilities
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="default" className="text-xs">
                Database Driven
              </Badge>
              <Badge variant="outline" className="text-xs">
                {totalScholarships} Records
              </Badge>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button 
                onClick={() => setLocation('/admin/scholarships/create')} 
                className="w-full justify-start"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Scholarship
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Database
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Database Statistics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-600">Total Scholarships</span>
                </div>
                <span className="text-sm font-semibold">{statsData?.totalScholarships || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">Providers</span>
                </div>
                <span className="text-sm font-semibold">{statsData?.totalProviders || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-600">Countries</span>
                </div>
                <span className="text-sm font-semibold">{statsData?.totalCountries || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-gray-600">Total Funding</span>
                </div>
                <span className="text-sm font-semibold">${statsData?.totalFunding || 0}M+</span>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Advanced Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {showAdvancedFilters && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-8">
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
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Provider Type</label>
                  <Select value={filterProviderType} onValueChange={setFilterProviderType}>
                    <SelectTrigger className="h-8">
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
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Funding Type</label>
                  <Select value={filterFundingType} onValueChange={setFilterFundingType}>
                    <SelectTrigger className="h-8">
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
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Difficulty Level</label>
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="h-8">
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
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Country</label>
                  <Select value={filterCountry} onValueChange={setFilterCountry}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                      <SelectItem value="united-kingdom">United Kingdom</SelectItem>
                      <SelectItem value="united-states">United States</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="germany">Germany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterProviderType("all");
                    setFilterCountry("all");
                    setFilterFundingType("all");
                    setFilterDifficulty("all");
                    setSearchTerm("");
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Scholarship Database</h1>
                <p className="text-gray-600">Manage comprehensive scholarship records with advanced filtering</p>
              </div>
            </div>

            {/* Search and Quick Stats */}
            <div className="flex items-center gap-4 mb-6">
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
              <Badge variant="outline" className="px-3 py-1">
                {scholarships.length} of {totalScholarships} scholarships
              </Badge>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <StatsCard
                title="Active Scholarships"
                value={statsData?.activeScholarships || 0}
                description="Currently available"
                icon={BookOpen}
                trend="+12% from last month"
              />
              <StatsCard
                title="Total Providers"
                value={statsData?.totalProviders || 0}
                description="Scholarship providers"
                icon={Users}
              />
              <StatsCard
                title="Countries Covered"
                value={statsData?.totalCountries || 0}
                description="Global coverage"
                icon={Globe}
              />
              <StatsCard
                title="Average Funding"
                value="$25,000"
                description="Per scholarship"
                icon={DollarSign}
              />
            </div>
          </div>

          {/* Scholarship Table */}
          <div className="flex-1 overflow-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle>Scholarship Records</CardTitle>
                <CardDescription>Complete database of international scholarship opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading scholarships...</p>
                    </div>
                  </div>
                ) : (
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scholarships.map((scholarship: Scholarship) => (
                        <TableRow key={scholarship.id}>
                          <TableCell className="font-medium">{scholarship.name}</TableCell>
                          <TableCell>{scholarship.providerName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{scholarship.providerType}</Badge>
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
                            >
                              {scholarship.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
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
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(scholarship.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
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
                      <span className="text-sm text-gray-600">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}