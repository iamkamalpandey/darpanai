import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  
  const { toast } = useToast();

  // Fetch all analyses with user data
  const { data: analyses = [], isLoading } = useQuery<AnalysisData[]>({
    queryKey: ["/api/admin/analyses"],
  });

  // Filter analyses based on all criteria
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "public" && analysis.isPublic) ||
      (statusFilter === "private" && !analysis.isPublic);
    
    const matchesSearch = searchTerm === "" ||
      analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filter
    const analysisDate = parseISO(analysis.createdAt);
    const now = new Date();
    let matchesDate = true;

    switch (dateFilter) {
      case "today":
        matchesDate = format(analysisDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
        break;
      case "week":
        matchesDate = isAfter(analysisDate, subDays(now, 7));
        break;
      case "month":
        matchesDate = isAfter(analysisDate, subMonths(now, 1));
        break;
      case "year":
        matchesDate = isAfter(analysisDate, subYears(now, 1));
        break;
      case "all":
      default:
        matchesDate = true;
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

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
    setSelectedAnalysis(analysis);
    setAnalysisDetailsOpen(true);
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by filename or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-sm font-medium">Visibility</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="public">Public Only</SelectItem>
                    <SelectItem value="private">Private Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date" className="text-sm font-medium">Analysis Date</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  {filteredAnalyses.map((analysis) => (
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
                        <div className="max-w-xs">
                          {analysis.analysisResults?.summary ? (
                            <p className="text-sm text-gray-600 truncate">
                              {analysis.analysisResults.summary}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">No summary available</p>
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
          </CardContent>
        </Card>

        {/* Analysis Details Dialog */}
        <Dialog open={analysisDetailsOpen} onOpenChange={setAnalysisDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Analysis Report Details</DialogTitle>
              <DialogDescription>
                Complete analysis report for {selectedAnalysis?.fileName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedAnalysis && (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Document Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">File Name</Label>
                            <p className="text-sm text-gray-600">{selectedAnalysis.fileName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Analysis Date</Label>
                            <p className="text-sm text-gray-600">
                              {format(new Date(selectedAnalysis.createdAt), "PPP")}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Visibility</Label>
                            <div className="mt-1">
                              <Badge variant={getVisibilityBadgeVariant(selectedAnalysis.isPublic)}>
                                {selectedAnalysis.isPublic ? "Public" : "Private"}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">User</Label>
                            <p className="text-sm text-gray-600">
                              {selectedAnalysis.user ? 
                                `${selectedAnalysis.user.firstName} ${selectedAnalysis.user.lastName}` :
                                "User not found"
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Summary */}
                      {selectedAnalysis.analysisResults?.summary && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Analysis Summary</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {selectedAnalysis.analysisResults.summary}
                            </p>
                          </div>
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
      </div>
    </AdminLayout>
  );
}