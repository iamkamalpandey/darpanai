import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { AnalysisModal } from "@/components/AnalysisModal";
import { EnhancedFilters, FilterOptions, searchInText, filterByDateRange } from "@/components/EnhancedFilters";
import { Pagination, usePagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Eye, Download, User, Calendar, CheckCircle, AlertTriangle, Info, TrendingUp, Filter, Shield } from "lucide-react";
import { format, isAfter, parseISO, subDays, subMonths, subYears } from "date-fns";

interface AnalysisData {
  id: number;
  userId: number;
  fileName: string;
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
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);
  const [analysisDetailsOpen, setAnalysisDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAnalysisId, setModalAnalysisId] = useState<number | null>(null);
  const [modalAnalysisType, setModalAnalysisType] = useState<'visa_rejection' | 'enrollment' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  const { toast } = useToast();

  // Handle opening analysis modal
  const openAnalysisModal = (analysisId: number, analysisType: 'visa_rejection' | 'enrollment') => {
    setModalAnalysisId(analysisId);
    setModalAnalysisType(analysisType);
    setModalOpen(true);
  };

  const closeAnalysisModal = () => {
    setModalOpen(false);
    setModalAnalysisId(null);
    setModalAnalysisType(null);
  };

  // Fetch all analyses with user data
  const { data: analyses = [], isLoading } = useQuery<AnalysisData[]>({
    queryKey: ["/api/admin/analyses"],
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

    // Public/Private filter
    if (filters.isPublic !== null && filters.isPublic !== undefined) {
      filtered = filtered.filter(analysis => analysis.isPublic === filters.isPublic);
    }

    // Date range filter
    if (filters.dateRange) {
      filtered = filterByDateRange(filtered, 'createdAt', filters.dateRange);
    }

    // Severity filter for rejection analyses
    if (filters.severity) {
      filtered = filtered.filter(analysis => {
        if (analysis.analysisResults?.rejectionReasons) {
          return analysis.analysisResults.rejectionReasons.some(reason => 
            reason.severity === filters.severity
          );
        }
        return true;
      });
    }

    return filtered;
  }, [analyses, filters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAnalyses = filteredAnalyses.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // CSV export functionality
  const exportAnalysesCSV = () => {
    const csvData = filteredAnalyses.map(analysis => ({
      ID: analysis.id,
      'File Name': analysis.fileName,
      'User ID': analysis.userId,
      'User Name': analysis.user ? `${analysis.user.firstName} ${analysis.user.lastName}` : 'N/A',
      'Username': analysis.user?.username || 'N/A',
      'User Email': analysis.user?.email || 'N/A',
      'Summary': analysis.analysisResults?.summary || 'N/A',
      'Rejection Reasons Count': analysis.analysisResults?.rejectionReasons?.length || 0,
      'Recommendations Count': analysis.analysisResults?.recommendations?.length || 0,
      'Next Steps Count': analysis.analysisResults?.nextSteps?.length || 0,
      'Visibility': analysis.isPublic ? 'Public' : 'Private',
      'Created At': format(new Date(analysis.createdAt), "yyyy-MM-dd HH:mm:ss")
    }));

    const csvHeaders = Object.keys(csvData[0] || {});
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => csvHeaders.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analyses-export-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Success", description: `Exported ${csvData.length} analyses to CSV` });
  };

  // Export analyses data (legacy endpoint)
  const exportAnalyses = () => {
    window.open("/api/admin/export/analyses", "_blank");
  };

  const openAnalysisDetails = (analysis: AnalysisData) => {
    // Use the modal popup for standardized analysis presentation
    openAnalysisModal(analysis.id, 'visa_rejection');
  };

  const getVisibilityBadgeVariant = (isPublic: boolean) => {
    return isPublic ? "default" : "secondary";
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category.toLowerCase()) {
      case "financial": return "destructive";
      case "documentation": return "secondary";
      case "eligibility": return "outline";
      case "academic": return "default";
      case "immigration_history": return "secondary";
      case "ties_to_home": return "outline";
      case "credibility": return "destructive";
      case "general": return "outline";
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
            <p className="text-gray-600">Monitor and manage ALL user analyses (admin access overrides privacy settings)</p>
          </div>
          <Button onClick={exportAnalysesCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Admin Access Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <h3 className="font-medium text-blue-900">Administrative Access</h3>
              <p className="text-sm text-blue-700">
                As an admin, you have full access to ALL user analyses including those marked as "Private" by users. 
                User privacy settings do not apply to administrative access.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <EnhancedFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          config={{
            showSearch: true,
            showAnalysisType: true,
            showDateRange: true,
            showSeverity: true,
          }}
          resultCount={filteredAnalyses.length}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredAnalyses.length}</div>
              <p className="text-xs text-gray-600 mt-1">of {analyses.length} total</p>
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



        {/* Analyses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Reports</CardTitle>
            <CardDescription>
              Complete list of ALL visa rejection analysis reports with user details (includes both public and private analyses)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Analysis Summary</TableHead>
                    <TableHead>Rejection Issues</TableHead>
                    <TableHead>User Privacy Setting</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAnalyses.map((analysis) => (
                    <TableRow key={analysis.id}>
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
                          
                          {/* Show recommendations count */}
                          {analysis.analysisResults?.recommendations && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {analysis.analysisResults.recommendations.length} recommendation(s) provided
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
                        <Badge variant={getVisibilityBadgeVariant(analysis.isPublic)}>
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
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
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

        {/* Complete Analysis Details Dialog */}
        <Dialog open={analysisDetailsOpen} onOpenChange={setAnalysisDetailsOpen}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Complete Analysis Report</DialogTitle>
              <DialogDescription>
                Full original analysis data for {selectedAnalysis?.fileName} by {selectedAnalysis?.user?.firstName} {selectedAnalysis?.user?.lastName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedAnalysis && (
              <ScrollArea className="h-[80vh] w-full">
                <div className="space-y-6 pr-4">
                  {/* Original Analysis Summary */}
                  {selectedAnalysis.analysisResults?.summary && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Original AI Analysis Summary
                      </h3>
                      <div className="bg-white p-4 rounded border border-blue-100">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                          {selectedAnalysis.analysisResults.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Complete Rejection Reasons */}
                  {selectedAnalysis.analysisResults?.rejectionReasons && selectedAnalysis.analysisResults.rejectionReasons.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h3 className="font-semibold text-red-900 mb-3 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Identified Rejection Reasons ({selectedAnalysis.analysisResults.rejectionReasons.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedAnalysis.analysisResults.rejectionReasons.map((reason, idx) => (
                          <div key={idx} className="bg-white p-4 rounded border border-red-100">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-red-800">{reason.title}</h4>
                              {(reason as any).category && (
                                <Badge variant="outline" className="text-xs">
                                  {formatCategoryName((reason as any).category)}
                                </Badge>
                              )}
                              {(reason as any).severity && (
                                <Badge variant={getCategoryBadgeVariant((reason as any).severity)} className="text-xs">
                                  {(reason as any).severity}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                              {reason.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Complete Recommendations */}
                  {selectedAnalysis.analysisResults?.recommendations && selectedAnalysis.analysisResults.recommendations.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        AI-Generated Recommendations ({selectedAnalysis.analysisResults.recommendations.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedAnalysis.analysisResults.recommendations.map((rec, idx) => (
                          <div key={idx} className="bg-white p-4 rounded border border-green-100">
                            <h4 className="font-medium text-green-800 mb-2">{rec.title}</h4>
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                              {rec.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Complete Next Steps */}
                  {selectedAnalysis.analysisResults?.nextSteps && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Suggested Next Steps
                      </h3>
                      <div className="bg-white p-4 rounded border border-purple-100">
                        {Array.isArray(selectedAnalysis.analysisResults.nextSteps) ? (
                          <div className="space-y-3">
                            {selectedAnalysis.analysisResults.nextSteps.map((step, idx) => (
                              <div key={idx} className="flex items-start space-x-3">
                                <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="flex-1">
                                  {typeof step === 'string' ? (
                                    <p className="text-gray-700 text-sm leading-relaxed font-mono">{step}</p>
                                  ) : (
                                    <div>
                                      <h4 className="font-medium text-purple-800 text-sm">{(step as any).title || (step as any).step}</h4>
                                      <p className="text-gray-700 text-sm leading-relaxed mt-1 font-mono">
                                        {(step as any).description}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                            {selectedAnalysis.analysisResults.nextSteps}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Analysis Metadata */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Info className="h-5 w-5 mr-2" />
                      Analysis Metadata
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Document:</span>
                        <p className="text-gray-600">{selectedAnalysis.fileName}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Analysis Date:</span>
                        <p className="text-gray-600">{format(new Date(selectedAnalysis.createdAt), "MMM dd, yyyy 'at' h:mm a")}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">User:</span>
                        <p className="text-gray-600">
                          {selectedAnalysis.user?.firstName} {selectedAnalysis.user?.lastName} (@{selectedAnalysis.user?.username})
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Privacy Setting:</span>
                        <Badge variant={selectedAnalysis.isPublic ? "default" : "secondary"}>
                          {selectedAnalysis.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="issues" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    {selectedAnalysis.analysisResults?.rejectionReasons?.length ? (
                      <div className="space-y-4">
                        {selectedAnalysis.analysisResults.rejectionReasons.map((reason, idx) => (
                          <Card key={idx}>
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-base">{reason.title}</CardTitle>
                                <Badge variant={getCategoryBadgeVariant((reason as any).category || (reason as any).severity || 'general')}>
                                  {getCategoryIcon((reason as any).category || (reason as any).severity || 'general')}
                                  <span className="ml-1">{formatCategoryName((reason as any).category || (reason as any).severity || 'general')}</span>
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-sm text-gray-600">{reason.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No rejection issues found</h3>
                        <p className="text-gray-600">This analysis doesn't contain rejection reasons.</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    {selectedAnalysis.analysisResults?.recommendations?.length ? (
                      <div className="space-y-4">
                        {selectedAnalysis.analysisResults.recommendations.map((rec, idx) => (
                          <Card key={idx}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">{rec.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-sm text-gray-600">{rec.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations available</h3>
                        <p className="text-gray-600">This analysis doesn't contain recommendations.</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="next-steps" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    {selectedAnalysis.analysisResults?.nextSteps?.length ? (
                      <div className="space-y-4">
                        {selectedAnalysis.analysisResults.nextSteps.map((step, idx) => (
                          <Card key={idx}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Step {idx + 1}: {step.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No next steps available</h3>
                        <p className="text-gray-600">This analysis doesn't contain next steps.</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Analysis Modal */}
        <AnalysisModal
          analysisId={modalAnalysisId}
          analysisType={modalAnalysisType}
          isOpen={modalOpen}
          onClose={closeAnalysisModal}
        />
      </div>
    </AdminLayout>
  );
}