import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { EnhancedFilters, FilterOptions, searchInText, filterByDateRange } from "@/components/EnhancedFilters";
import { Pagination, usePagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FileText, Eye, Download, User, Calendar, CheckCircle, AlertTriangle, Info, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";

interface AnalysisData {
  id: number;
  userId: number;
  fileName: string;
  analysisType?: 'visa_analysis' | 'enrollment_analysis';
  analysisResults: {
    summary?: string;
    rejectionReasons?: Array<{
      title: string;
      description: string;
      category?: string;
      severity?: 'high' | 'medium' | 'low';
    }>;
    recommendations?: Array<{
      title: string;
      description: string;
    }>;
    nextSteps?: Array<{
      title: string;
      description: string;
    }> | string;
    // Enrollment analysis specific fields
    institutionName?: string;
    studentName?: string;
    programName?: string;
    documentType?: string;
    analysisScore?: number;
    confidence?: number;
    keyFindings?: Array<{
      title: string;
      description: string;
      importance: 'high' | 'medium' | 'low';
    }>;
    missingInformation?: Array<{
      field: string;
      description: string;
      impact: string;
    }>;
  };
  createdAt: string;
  isPublic: boolean;
  user?: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export default function AdminAnalyses() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);
  const [analysisDetailsOpen, setAnalysisDetailsOpen] = useState(false);

  const itemsPerPage = 9;

  // Fetch analyses with optimized caching
  const { data: analyses = [], isLoading } = useQuery<AnalysisData[]>({
    queryKey: ["/api/admin/analyses"],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Enhanced filtering with memoization for performance
  const filteredAnalyses = useMemo(() => {
    let filtered = analyses;

    // Text search across multiple fields
    if (filters.searchTerm) {
      filtered = filtered.filter(analysis => 
        searchInText(analysis, filters.searchTerm!, [
          'fileName',
          'user.firstName',
          'user.lastName', 
          'user.username',
          'user.email',
          'analysisResults.summary'
        ])
      );
    }

    // Analysis type filter
    if (filters.analysisType && filters.analysisType !== 'all') {
      filtered = filtered.filter(analysis => analysis.analysisType === filters.analysisType);
    }

    // Severity filter (for rejection analyses)
    if (filters.severity && filters.severity !== 'all') {
      filtered = filtered.filter(analysis => 
        analysis.analysisResults?.rejectionReasons?.some((reason: any) => 
          reason.severity === filters.severity || reason.category === filters.severity
        )
      );
    }

    // Public/Private filter
    if (filters.isPublic !== null && filters.isPublic !== undefined) {
      filtered = filtered.filter(analysis => analysis.isPublic === filters.isPublic);
    }

    // Date range filter
    if (filters.dateRange) {
      filtered = filterByDateRange(filtered, 'createdAt', filters.dateRange);
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let valueA: any, valueB: any;
        
        switch (filters.sortBy) {
          case 'name':
            valueA = a.fileName.toLowerCase();
            valueB = b.fileName.toLowerCase();
            break;
          case 'type':
            valueA = a.analysisType || 'visa_analysis';
            valueB = b.analysisType || 'visa_analysis';
            break;
          case 'user':
            valueA = a.user ? `${a.user.firstName} ${a.user.lastName}`.toLowerCase() : '';
            valueB = b.user ? `${b.user.firstName} ${b.user.lastName}`.toLowerCase() : '';
            break;
          case 'date':
          default:
            valueA = new Date(a.createdAt).getTime();
            valueB = new Date(b.createdAt).getTime();
            break;
        }
        
        if (filters.sortOrder === 'asc') {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
    }

    return filtered;
  }, [analyses, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAnalyses = filteredAnalyses.slice(startIndex, startIndex + itemsPerPage);

  // Filter reset on filter change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters, setCurrentPage]);

  const openAnalysisDetails = (analysis: AnalysisData) => {
    setSelectedAnalysis(analysis);
    setAnalysisDetailsOpen(true);
  };

  const exportAnalysesCSV = () => {
    const csvData = filteredAnalyses.map(analysis => ({
      fileName: analysis.fileName,
      user: analysis.user ? `${analysis.user.firstName} ${analysis.user.lastName}` : 'N/A',
      email: analysis.user?.email || 'N/A',
      summary: analysis.analysisResults?.summary || 'No summary',
      rejectionCount: analysis.analysisResults?.rejectionReasons?.length || 0,
      recommendationCount: analysis.analysisResults?.recommendations?.length || 0,
      isPublic: analysis.isPublic ? 'Public' : 'Private',
      createdAt: format(new Date(analysis.createdAt), "yyyy-MM-dd HH:mm")
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-reports-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category.toLowerCase()) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      case "financial": return "destructive";
      case "documentation": return "secondary";
      case "eligibility": return "outline";
      default: return "outline";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "financial": return <AlertTriangle className="h-3 w-3" />;
      case "documentation": return <FileText className="h-3 w-3" />;
      case "eligibility": return <Info className="h-3 w-3" />;
      case "academic": return <CheckCircle className="h-3 w-3" />;
      case "immigration_history": return <AlertTriangle className="h-3 w-3" />;
      case "ties_to_home": return <Info className="h-3 w-3" />;
      case "credibility": return <AlertTriangle className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const formatCategoryName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analyses...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analysis Reports</h1>
            <p className="text-gray-600">Complete original analysis data for all users (admin access)</p>
          </div>
          <Button onClick={exportAnalysesCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Admin Access Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900">Admin Access Override</h3>
              <p className="text-sm text-blue-700 mt-1">
                You have access to ALL user analyses including private reports. This view shows complete original AI-generated analysis data.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredAnalyses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Reports</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredAnalyses.filter(a => a.isPublic).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Private Reports</CardTitle>
              <User className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredAnalyses.filter(a => !a.isPublic).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredAnalyses.filter(a => {
                  const analysisDate = new Date(a.createdAt);
                  const now = new Date();
                  return analysisDate.getMonth() === now.getMonth() && 
                         analysisDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <EnhancedFilters
          filters={filters}
          onFiltersChange={setFilters}
          config={{
            showSearch: true,
            showAnalysisType: true,
            showSeverity: true,
            showPublicFilter: true,
            showDateRange: true,
            showSorting: true,
          }}
          resultCount={filteredAnalyses.length}
          placeholder="Search by filename, user, or analysis content..."
        />

        {/* Analyses Table with Complete Data */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Analysis Reports</CardTitle>
            <CardDescription>
              Full original AI-generated analysis data for all users with detailed summaries and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Complete Analysis Summary</TableHead>
                    <TableHead>Rejection Issues</TableHead>
                    <TableHead>Privacy</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAnalyses.map((analysis) => (
                    <TableRow key={analysis.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-600" />
                          <div>
                            <div className="font-medium">{analysis.fileName}</div>
                            <div className="text-sm text-gray-600">ID: {analysis.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {analysis.user ? (
                          <div>
                            <div className="font-medium">
                              {analysis.user.firstName} {analysis.user.lastName}
                            </div>
                            <div className="text-sm text-gray-600">@{analysis.user.username}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">User not found</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md space-y-2">
                          {/* Analysis Type Badge */}
                          <div className="mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {analysis.analysisType === 'enrollment_analysis' ? 'Enrollment Analysis' : 'Visa Analysis'}
                            </Badge>
                          </div>
                          
                          {analysis.analysisResults?.summary ? (
                            <div className="bg-gray-50 p-3 rounded-lg border">
                              <p className="text-sm text-gray-800 font-medium mb-2">Analysis Summary:</p>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {analysis.analysisResults.summary}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No summary available</p>
                          )}
                          
                          {/* Enrollment Analysis specific info */}
                          {analysis.analysisType === 'enrollment_analysis' && (
                            <div className="space-y-1">
                              {analysis.analysisResults?.institutionName && (
                                <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                  Institution: {analysis.analysisResults.institutionName}
                                </div>
                              )}
                              {analysis.analysisResults?.programName && (
                                <div className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                  Program: {analysis.analysisResults.programName}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Show key findings for enrollment analysis */}
                          {analysis.analysisType === 'enrollment_analysis' && (analysis.analysisResults as any)?.keyFindings && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {Array.isArray((analysis.analysisResults as any).keyFindings) 
                                ? (analysis.analysisResults as any).keyFindings.length 
                                : 0} key finding(s) identified
                            </div>
                          )}
                          
                          {/* Show recommendations count */}
                          {analysis.analysisResults?.recommendations && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {Array.isArray(analysis.analysisResults.recommendations) 
                                ? analysis.analysisResults.recommendations.length 
                                : 0} recommendation(s) provided
                            </div>
                          )}
                          
                          {/* Show next steps count */}
                          {analysis.analysisResults?.nextSteps && (
                            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                              {Array.isArray(analysis.analysisResults.nextSteps) 
                                ? analysis.analysisResults.nextSteps.length 
                                : 'Multiple'} next step(s) outlined
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {analysis.analysisResults?.rejectionReasons?.slice(0, 2).map((reason, idx) => {
                            const categoryOrSeverity = (reason as any).category || (reason as any).severity || 'general';
                            return (
                              <div key={idx} className="flex items-center">
                                <Badge variant={getCategoryBadgeVariant(categoryOrSeverity)} className="mr-1">
                                  {getCategoryIcon(categoryOrSeverity)}
                                  <span className="ml-1 text-xs">{formatCategoryName(categoryOrSeverity)}</span>
                                </Badge>
                              </div>
                            );
                          })}
                          {(analysis.analysisResults?.rejectionReasons?.length || 0) > 2 && (
                            <div className="text-xs text-gray-500">
                              +{(analysis.analysisResults?.rejectionReasons?.length || 0) - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={analysis.isPublic ? "default" : "secondary"}>
                          {analysis.isPublic ? "Public" : "Private"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(analysis.createdAt), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAnalysisDetails(analysis)}
                          className="hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredAnalyses.length}
                  itemsPerPage={itemsPerPage}
                  showPageInfo={true}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Reports Dialog */}
        <Dialog open={analysisDetailsOpen} onOpenChange={setAnalysisDetailsOpen}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900">Reports</DialogTitle>
              <DialogDescription className="text-gray-600">
                Analysis report for {selectedAnalysis?.fileName} by {selectedAnalysis?.user?.firstName} {selectedAnalysis?.user?.lastName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedAnalysis && (
              <ScrollArea className="h-[80vh] w-full">
                <div className="space-y-6 pr-4">
                  {/* Analysis Summary */}
                  {selectedAnalysis.analysisResults?.summary && (
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Analysis Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {selectedAnalysis.analysisResults.summary}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Rejection Reasons with Enhanced User-Friendly Display */}
                  {selectedAnalysis.analysisResults?.rejectionReasons && selectedAnalysis.analysisResults.rejectionReasons.length > 0 && (
                    <Card className="border-l-4 border-l-red-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          Why Your Application Was Rejected ({selectedAnalysis.analysisResults.rejectionReasons.length} Issues Found)
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          These are the specific reasons mentioned in your rejection letter. Understanding these helps you prepare a stronger reapplication.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedAnalysis.analysisResults.rejectionReasons.map((reason, idx) => (
                            <div key={idx} className="bg-red-50 p-4 rounded-lg border border-red-200">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3">
                                  <div className="bg-red-100 p-2 rounded-full flex-shrink-0 mt-0.5">
                                    {getCategoryIcon((reason as any).category || 'general')}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-red-900 mb-1">{reason.title}</h4>
                                    <div className="flex gap-2 mb-2">
                                      {(reason as any).category && (
                                        <Badge variant="outline" className="text-xs bg-white">
                                          {formatCategoryName((reason as any).category)} Issue
                                        </Badge>
                                      )}
                                      {(reason as any).severity && (
                                        <Badge variant={getCategoryBadgeVariant((reason as any).severity)} className="text-xs">
                                          {(reason as any).severity === 'high' ? 'Critical' : (reason as any).severity === 'medium' ? 'Important' : 'Minor'} Impact
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-11">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {reason.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Key Findings (Enrollment Analysis) */}
                  {selectedAnalysis.analysisType === 'enrollment_analysis' && (selectedAnalysis.analysisResults as any)?.keyFindings && Array.isArray((selectedAnalysis.analysisResults as any).keyFindings) && (selectedAnalysis.analysisResults as any).keyFindings.length > 0 && (
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Key Findings ({(selectedAnalysis.analysisResults as any).keyFindings.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {(selectedAnalysis.analysisResults as any).keyFindings.map((finding: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-lg border">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{finding.title}</h4>
                                <Badge variant={finding.importance === 'high' ? 'destructive' : finding.importance === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                                  {finding.importance}
                                </Badge>
                              </div>
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {finding.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Missing Information (Enrollment Analysis) */}
                  {selectedAnalysis.analysisType === 'enrollment_analysis' && (selectedAnalysis.analysisResults as any)?.missingInformation && Array.isArray((selectedAnalysis.analysisResults as any).missingInformation) && (selectedAnalysis.analysisResults as any).missingInformation.length > 0 && (
                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          Missing Information ({(selectedAnalysis.analysisResults as any).missingInformation.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {(selectedAnalysis.analysisResults as any).missingInformation.map((missing: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-lg border">
                              <h4 className="font-medium text-gray-900 mb-2">{missing.field}</h4>
                              <p className="text-gray-700 leading-relaxed mb-2">
                                {missing.description}
                              </p>
                              <div className="bg-orange-50 p-3 rounded border border-orange-200">
                                <p className="text-sm font-medium text-orange-800 mb-1">Impact:</p>
                                <p className="text-sm text-orange-700">{missing.impact}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recommendations with Enhanced User-Friendly Display */}
                  {selectedAnalysis.analysisResults?.recommendations && selectedAnalysis.analysisResults.recommendations.length > 0 && (
                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          Expert Recommendations ({selectedAnalysis.analysisResults.recommendations.length} Action Items)
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          These are actionable steps you can take to improve your chances for future applications. Each recommendation is based on the specific issues found in your document.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedAnalysis.analysisResults.recommendations.map((rec: any, idx: number) => (
                            <div key={idx} className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-full flex-shrink-0 mt-0.5">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-green-900">{rec.title}</h4>
                                    <div className="flex gap-2">
                                      {rec.priority && (
                                        <Badge 
                                          variant={rec.priority === 'urgent' ? 'destructive' : rec.priority === 'important' ? 'secondary' : 'outline'} 
                                          className="text-xs"
                                        >
                                          {rec.priority === 'urgent' ? 'Do First' : rec.priority === 'important' ? 'High Priority' : 'When Possible'}
                                        </Badge>
                                      )}
                                      {rec.category && (
                                        <Badge variant="outline" className="text-xs bg-white">
                                          {formatCategoryName(rec.category)}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {rec.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Next Steps with Enhanced User-Friendly Display */}
                  {selectedAnalysis.analysisResults?.nextSteps && (
                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                          Your Action Plan - What To Do Next
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Follow these steps in order to prepare for your next application. Each step is designed to address the specific issues found in your analysis.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          {Array.isArray(selectedAnalysis.analysisResults.nextSteps) ? (
                            <div className="space-y-4">
                              {selectedAnalysis.analysisResults.nextSteps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                  <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1 bg-white p-3 rounded-lg border border-purple-100">
                                    {typeof step === 'string' ? (
                                      <div className="flex items-start gap-3">
                                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-gray-700 leading-relaxed">{step}</p>
                                      </div>
                                    ) : (
                                      <div>
                                        <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                                          <CheckCircle className="h-4 w-4 text-purple-600" />
                                          {(step as any).title || (step as any).step}
                                        </h4>
                                        <p className="text-gray-700 leading-relaxed">
                                          {(step as any).description}
                                        </p>
                                      </div>
                                    )}
                                    <div className="mt-2 text-xs text-purple-600 font-medium">
                                      Step {idx + 1} of {selectedAnalysis.analysisResults.nextSteps.length}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-white p-4 rounded-lg border border-purple-100">
                              <div className="flex items-start gap-3">
                                <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-purple-900 mb-2">Action Required</h4>
                                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {selectedAnalysis.analysisResults.nextSteps}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Analysis Metadata */}
                  <Card className="border-l-4 border-l-gray-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Info className="h-5 w-5 text-gray-600" />
                        Document Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-gray-500">Document Name</span>
                          <p className="text-gray-900 font-medium">{selectedAnalysis.fileName}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-gray-500">Analysis Date</span>
                          <p className="text-gray-900">{format(new Date(selectedAnalysis.createdAt), "MMM dd, yyyy 'at' h:mm a")}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-gray-500">User</span>
                          <p className="text-gray-900">
                            {selectedAnalysis.user?.firstName} {selectedAnalysis.user?.lastName}
                            <span className="text-gray-500 ml-1">(@{selectedAnalysis.user?.username})</span>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-gray-500">Privacy Setting</span>
                          <div>
                            <Badge variant={selectedAnalysis.isPublic ? "default" : "secondary"}>
                              {selectedAnalysis.isPublic ? 'Public' : 'Private'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}