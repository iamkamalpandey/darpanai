import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { EnhancedFilters } from "@/components/EnhancedFilters";
import { 
  FileText, 
  User, 
  Calendar, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  GraduationCap, 
  DollarSign,
  Info,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { format } from "date-fns";

// Enhanced numerical highlighting function
const formatNumericalInfo = (text: string): string => {
  if (!text) return '';
  
  let formattedText = text
    // Currency amounts with context
    .replace(/\$[\d,]+(?:\.\d{2})?(?:\s*(?:per\s+(?:year|semester|month|credit)|annually|monthly|semester|total|fee|cost|tuition|scholarship))?/gi, 
      '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">$&</span>')
    // Other currencies
    .replace(/(?:CAD|USD|EUR|GBP|AUD)\s*[\d,]+(?:\.\d{2})?/gi, 
      '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">$&</span>')
    .replace(/₹[\d,]+(?:\.\d{2})?/gi, 
      '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">$&</span>')
    // Percentages with context
    .replace(/\d+(?:\.\d+)?%(?:\s*(?:coverage|scholarship|discount|reduction|increase|decrease|of|tuition))?/gi, 
      '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">$&</span>')
    // GPA and scores
    .replace(/(?:GPA|CGPA|score)[\s:]*\d+(?:\.\d+)?/gi, 
      '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">$&</span>')
    .replace(/\d+(?:\.\d+)?(?:\s*(?:GPA|CGPA|points?))/gi, 
      '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">$&</span>')
    // Academic terms
    .replace(/\d+\s*(?:credits?|hours?|semesters?|years?|months?)/gi, 
      '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">$&</span>')
    // Dates
    .replace(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi, 
      '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">$&</span>')
    .replace(/(?:Fall|Spring|Summer|Winter)\s+\d{4}/gi, 
      '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">$&</span>');
  
  return formattedText;
};

interface FilterOptions {
  search?: string;
  analysisType?: 'visa_analysis' | 'enrollment_analysis' | 'all';
  severity?: string;
  country?: string;
  visaType?: string;
  dateRange?: string;
  isPublic?: boolean | null;
}

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
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { data: analyses = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/analyses'],
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const openAnalysisDetails = (analysis: AnalysisData) => {
    setSelectedAnalysis(analysis);
    setActiveTab('overview');
  };

  // Filter analyses based on current filters
  const filteredAnalyses = useMemo(() => {
    let filtered = analyses;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(analysis => 
        analysis.fileName.toLowerCase().includes(searchTerm) ||
        analysis.user?.firstName?.toLowerCase().includes(searchTerm) ||
        analysis.user?.lastName?.toLowerCase().includes(searchTerm) ||
        analysis.user?.email?.toLowerCase().includes(searchTerm) ||
        JSON.stringify(analysis.analysisResults).toLowerCase().includes(searchTerm)
      );
    }

    if (filters.analysisType && filters.analysisType !== 'all') {
      filtered = filtered.filter(analysis => analysis.analysisType === filters.analysisType);
    }

    if (filters.severity) {
      filtered = filtered.filter(analysis => 
        analysis.analysisResults?.rejectionReasons?.some(reason => 
          reason.severity === filters.severity
        )
      );
    }

    if (filters.isPublic !== null && filters.isPublic !== undefined) {
      filtered = filtered.filter(analysis => analysis.isPublic === filters.isPublic);
    }

    return filtered;
  }, [analyses, filters]);

  // Pagination logic
  const totalItems = filteredAnalyses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAnalyses = filteredAnalyses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading analyses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading analyses</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analysis Reports</h1>
            <p className="text-gray-600 mt-2">Monitor and manage all document analysis reports</p>
          </div>
        </div>

        {/* Enhanced Filters */}
        <EnhancedFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          showAnalysisType
          showSeverity
          showDateRange
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {paginatedAnalyses.length} of {totalItems} analyses
          </p>
        </div>
      </div>

      {/* Analyses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedAnalyses.map((analysis) => (
          <Card key={analysis.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                    {analysis.fileName}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {analysis.user ? `${analysis.user.firstName} ${analysis.user.lastName}` : 'Unknown User'}
                  </p>
                </div>
                <Badge 
                  variant={analysis.analysisType === 'enrollment_analysis' ? 'default' : 'secondary'}
                  className="ml-2 flex-shrink-0"
                >
                  {analysis.analysisType === 'enrollment_analysis' ? 'Enrollment' : 'Visa'}
                </Badge>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(analysis.createdAt), "MMM dd, yyyy")}</span>
              </div>

              {/* Quick Stats */}
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="flex items-center gap-4 text-sm">
                  {analysis.analysisResults?.analysisScore && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600">Score: {analysis.analysisResults.analysisScore}</span>
                    </div>
                  )}
                  {analysis.analysisResults?.confidence && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">{Math.round(analysis.analysisResults.confidence * 100)}%</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAnalysisDetails(analysis)}
                  className="hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Empty State */}
      {filteredAnalyses.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
          <p className="text-gray-500">Try adjusting your filters to see more results.</p>
        </div>
      )}

      {/* Analysis Details Dialog */}
      <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analysis Report
            </DialogTitle>
          </DialogHeader>

          {selectedAnalysis && (
            <div className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document Information */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <FileText className="h-5 w-5" />
                      Document Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Filename</span>
                      <p className="text-gray-800 break-words">{selectedAnalysis.fileName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Type</span>
                      <p className="text-gray-800">
                        {selectedAnalysis.analysisType === 'enrollment_analysis' ? 'Enrollment Document' : 'Visa Document'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* User Information */}
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <User className="h-5 w-5" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name</span>
                      <p className="text-gray-800 break-words">
                        {selectedAnalysis.user ? `${selectedAnalysis.user.firstName} ${selectedAnalysis.user.lastName}` : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Email</span>
                      <p className="text-gray-800 break-words">{selectedAnalysis.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Analysis Date</span>
                      <p className="text-gray-800">{format(new Date(selectedAnalysis.createdAt), "MMMM do, yyyy")}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  {(selectedAnalysis.analysisResults?.rejectionReasons?.length > 0 || 
                    selectedAnalysis.analysisResults?.keyFindings?.length > 0) && (
                    <button
                      onClick={() => setActiveTab('key-findings')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'key-findings' 
                          ? 'border-red-500 text-red-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {selectedAnalysis.analysisType === 'enrollment_analysis' ? 'Key Findings' : 'Issues'}
                    </button>
                  )}
                  {selectedAnalysis.analysisResults?.recommendations?.length > 0 && (
                    <button
                      onClick={() => setActiveTab('recommendations')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'recommendations' 
                          ? 'border-green-500 text-green-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Recommendations
                    </button>
                  )}
                  {(selectedAnalysis.analysisResults?.nextSteps?.length > 0 || 
                    typeof selectedAnalysis.analysisResults?.nextSteps === 'string') && (
                    <button
                      onClick={() => setActiveTab('next-steps')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'next-steps' 
                          ? 'border-purple-500 text-purple-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Next Steps
                    </button>
                  )}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Document Summary */}
                    {selectedAnalysis.analysisResults?.summary && (
                      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                          <CardTitle className="flex items-center gap-2 text-gray-800">
                            <BookOpen className="h-5 w-5" />
                            Document Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div 
                            className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words overflow-hidden"
                            dangerouslySetInnerHTML={{ 
                              __html: formatNumericalInfo(selectedAnalysis.analysisResults.summary) 
                            }}
                          />
                        </CardContent>
                      </Card>
                    )}

                    {/* Academic Information for Enrollment Analysis */}
                    {selectedAnalysis.analysisType === 'enrollment_analysis' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Academic Details */}
                        {(selectedAnalysis.analysisResults.institutionName || 
                          selectedAnalysis.analysisResults.programName || 
                          selectedAnalysis.analysisResults.studentName) && (
                          <Card>
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                              <CardTitle className="flex items-center gap-2 text-green-800">
                                <GraduationCap className="h-5 w-5" />
                                Academic Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                              {selectedAnalysis.analysisResults.institutionName && (
                                <div>
                                  <span className="font-medium text-gray-600">Institution:</span>
                                  <div 
                                    className="text-gray-800 mt-1 break-words"
                                    dangerouslySetInnerHTML={{ 
                                      __html: formatNumericalInfo(selectedAnalysis.analysisResults.institutionName) 
                                    }}
                                  />
                                </div>
                              )}
                              {selectedAnalysis.analysisResults.programName && (
                                <div>
                                  <span className="font-medium text-gray-600">Program:</span>
                                  <div 
                                    className="text-gray-800 mt-1 break-words"
                                    dangerouslySetInnerHTML={{ 
                                      __html: formatNumericalInfo(selectedAnalysis.analysisResults.programName) 
                                    }}
                                  />
                                </div>
                              )}
                              {selectedAnalysis.analysisResults.studentName && (
                                <div>
                                  <span className="font-medium text-gray-600">Student:</span>
                                  <div 
                                    className="text-gray-800 mt-1 break-words"
                                    dangerouslySetInnerHTML={{ 
                                      __html: formatNumericalInfo(selectedAnalysis.analysisResults.studentName) 
                                    }}
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Analysis Metrics */}
                        {(selectedAnalysis.analysisResults.analysisScore || 
                          selectedAnalysis.analysisResults.confidence) && (
                          <Card>
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                              <CardTitle className="flex items-center gap-2 text-purple-800">
                                <TrendingUp className="h-5 w-5" />
                                Analysis Metrics
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                              {selectedAnalysis.analysisResults.analysisScore && (
                                <div>
                                  <span className="font-medium text-gray-600">Analysis Score:</span>
                                  <div 
                                    className="text-gray-800 mt-1"
                                    dangerouslySetInnerHTML={{ 
                                      __html: formatNumericalInfo(selectedAnalysis.analysisResults.analysisScore.toString()) 
                                    }}
                                  />
                                </div>
                              )}
                              {selectedAnalysis.analysisResults.confidence && (
                                <div>
                                  <span className="font-medium text-gray-600">Confidence Level:</span>
                                  <div 
                                    className="text-gray-800 mt-1"
                                    dangerouslySetInnerHTML={{ 
                                      __html: formatNumericalInfo(`${Math.round(selectedAnalysis.analysisResults.confidence * 100)}%`) 
                                    }}
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Complete Analysis Results */}
                    <Card>
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                          <Info className="h-5 w-5" />
                          Complete Analysis Data
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                          <div className="space-y-3">
                            {Object.entries(selectedAnalysis.analysisResults || {}).map(([key, value]: [string, any]) => (
                              <div key={key} className="border-b border-gray-200 pb-2 last:border-b-0">
                                <div className="text-sm font-medium text-gray-600 mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                </div>
                                <div 
                                  className="text-gray-800 text-sm break-words overflow-hidden"
                                  dangerouslySetInnerHTML={{ 
                                    __html: formatNumericalInfo(
                                      typeof value === 'object' 
                                        ? JSON.stringify(value, null, 2) 
                                        : String(value || 'N/A')
                                    ) 
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Key Findings/Issues Tab */}
                {activeTab === 'key-findings' && (
                  <div className="space-y-6">
                    {/* Rejection Reasons for Visa Analysis */}
                    {selectedAnalysis.analysisType === 'visa_analysis' && 
                     selectedAnalysis.analysisResults?.rejectionReasons && 
                     selectedAnalysis.analysisResults.rejectionReasons.length > 0 && (
                      <Card>
                        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                          <CardTitle className="flex items-center gap-2 text-red-800">
                            <AlertTriangle className="h-5 w-5" />
                            Rejection Reasons
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          {selectedAnalysis.analysisResults.rejectionReasons.map((reason: any, idx: number) => (
                            <div key={idx} className="border-l-4 border-red-200 pl-4 py-2">
                              <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                                <h4 className="font-semibold text-gray-800 flex-1 min-w-0 break-words">{reason.title}</h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge variant="outline" className="text-xs">
                                    {reason.category || 'General'}
                                  </Badge>
                                  <Badge 
                                    variant={reason.severity === 'high' ? 'destructive' : reason.severity === 'medium' ? 'default' : 'secondary'} 
                                    className="text-xs"
                                  >
                                    {reason.severity || 'medium'}
                                  </Badge>
                                </div>
                              </div>
                              <div 
                                className="text-gray-700 leading-relaxed break-words overflow-hidden"
                                dangerouslySetInnerHTML={{ 
                                  __html: formatNumericalInfo(reason.description) 
                                }}
                              />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Key Findings for Enrollment Analysis */}
                    {selectedAnalysis.analysisType === 'enrollment_analysis' && 
                     selectedAnalysis.analysisResults?.keyFindings && 
                     selectedAnalysis.analysisResults.keyFindings.length > 0 && (
                      <Card>
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                          <CardTitle className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="h-5 w-5" />
                            Key Findings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          {selectedAnalysis.analysisResults.keyFindings.map((finding: any, idx: number) => (
                            <div key={idx} className="border-l-4 border-green-200 pl-4 py-2">
                              <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                                <h4 className="font-semibold text-gray-800 flex-1 min-w-0 break-words">{finding.title}</h4>
                                <Badge 
                                  variant={finding.importance === 'high' ? 'destructive' : finding.importance === 'medium' ? 'default' : 'secondary'}
                                  className="text-xs flex-shrink-0"
                                >
                                  {finding.importance || 'medium'} Importance
                                </Badge>
                              </div>
                              <div 
                                className="text-gray-700 leading-relaxed break-words overflow-hidden"
                                dangerouslySetInnerHTML={{ 
                                  __html: formatNumericalInfo(finding.description) 
                                }}
                              />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === 'recommendations' && selectedAnalysis.analysisResults?.recommendations && (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {selectedAnalysis.analysisResults.recommendations.map((recommendation: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-green-200 pl-4 py-2">
                          <h4 className="font-semibold text-gray-800 mb-2 break-words">{recommendation.title}</h4>
                          <div 
                            className="text-gray-700 leading-relaxed break-words overflow-hidden"
                            dangerouslySetInnerHTML={{ 
                              __html: formatNumericalInfo(recommendation.description) 
                            }}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Next Steps Tab */}
                {activeTab === 'next-steps' && selectedAnalysis.analysisResults?.nextSteps && (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        <ArrowRight className="h-5 w-5" />
                        Next Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {Array.isArray(selectedAnalysis.analysisResults.nextSteps) ? (
                        <div className="space-y-4">
                          {selectedAnalysis.analysisResults.nextSteps.map((step: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-800 mb-1 break-words">{step.title}</h4>
                                <div 
                                  className="text-gray-700 leading-relaxed break-words overflow-hidden"
                                  dangerouslySetInnerHTML={{ 
                                    __html: formatNumericalInfo(step.description) 
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div 
                          className="text-gray-700 leading-relaxed break-words overflow-hidden"
                          dangerouslySetInnerHTML={{ 
                            __html: formatNumericalInfo(selectedAnalysis.analysisResults.nextSteps) 
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}