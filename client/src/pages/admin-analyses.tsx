import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Search, Eye, Download, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { AnalysisDetailView } from "@/components/AnalysisDetailView";

interface Analysis {
  id: number;
  userId: number;
  fileName: string;
  analysisResults: any;
  createdAt: string;
  isPublic: boolean;
  user: {
    username: string;
    fullName: string;
    email: string;
  };
}

export default function AdminAnalyses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: analyses = [], isLoading } = useQuery<Analysis[]>({
    queryKey: ["/api/admin/analyses"],
  });

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAnalyses = analyses.length;
  const successfulAnalyses = analyses.filter(a => a.analysisResults).length;
  const publicAnalyses = analyses.filter(a => a.isPublic).length;
  const recentAnalyses = analyses.filter(a => 
    new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const handleViewDetails = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading analyses...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analysis Reports</h1>
            <p className="text-muted-foreground">Monitor all document analyses and their results</p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAnalyses}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successfulAnalyses}</div>
              <p className="text-xs text-muted-foreground">
                {totalAnalyses > 0 ? Math.round((successfulAnalyses / totalAnalyses) * 100) : 0}% success rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Analyses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publicAnalyses}</div>
              <p className="text-xs text-muted-foreground">Visible to users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentAnalyses}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by filename, username, or user name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Analyses Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Analysis Summary</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalyses.map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{analysis.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{analysis.user.fullName}</div>
                        <div className="text-sm text-muted-foreground">@{analysis.user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={analysis.analysisResults ? 'default' : 'destructive'}>
                        {analysis.analysisResults ? 'Completed' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      {analysis.analysisResults ? (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {analysis.analysisResults.summary?.substring(0, 120)}...
                          </p>
                          <div className="flex gap-1">
                            {analysis.analysisResults.rejectionReasons?.slice(0, 3).map((reason: any, idx: number) => (
                              <Badge 
                                key={idx} 
                                variant={reason.severity === 'high' ? 'destructive' : reason.severity === 'medium' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {reason.severity}
                              </Badge>
                            ))}
                            {analysis.analysisResults.rejectionReasons?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{analysis.analysisResults.rejectionReasons.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No analysis available</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={analysis.isPublic ? 'secondary' : 'outline'}>
                        {analysis.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(analysis.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(analysis)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Analysis Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Analysis Details</DialogTitle>
            </DialogHeader>
            {selectedAnalysis && (
              <AnalysisDetailView analysis={selectedAnalysis} showUserInfo={true} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}