import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  FileText, 
  Eye, 
  Calendar, 
  User, 
  Badge as BadgeIcon,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Info,
  GraduationCap,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedFilters } from '@/components/EnhancedFilters';
import { Pagination } from '@/components/Pagination';
import { useToast } from '@/hooks/use-toast';

// Enhanced numerical highlighting function
const formatNumericalInfo = (text: string): string => {
  if (!text) return '';
  
  // Comprehensive regex patterns for numerical data
  const patterns = [
    // Currency amounts with context
    /(\$[\d,]+(?:\.\d{2})?(?:\s*(?:USD|CAD|AUD|per\s+year|annually|per\s+semester|total|for\s+\w+))?)/gi,
    // Other currencies
    /(£[\d,]+(?:\.\d{2})?|€[\d,]+(?:\.\d{2})?|₹[\d,]+(?:\.\d{2})?)/gi,
    // Percentages with context
    /(\d+(?:\.\d+)?%(?:\s*(?:scholarship|coverage|tuition|reduction|discount|of))?)/gi,
    // Academic requirements
    /(\d+(?:\.\d+)?\s*(?:GPA|CGPA|credits?|hours?|points?))/gi,
    // Dates with academic context
    /((?:Fall|Spring|Summer|Winter)\s+\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})/gi,
    // Time periods
    /(\d+\s*(?:semesters?|years?|months?|weeks?))/gi,
    // Plain numbers with units in academic context
    /(\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*(?:students?|applications?|seats?|positions?))/gi
  ];

  let formattedText = text;
  
  patterns.forEach(pattern => {
    formattedText = formattedText.replace(pattern, '<span style="background-color: #dbeafe; color: #1e40af; padding: 2px 4px; border-radius: 3px; font-weight: 600;">$1</span>');
  });
  
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
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);
  const [analysisDetailsOpen, setAnalysisDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const itemsPerPage = 9;

  // Fetch analyses with optimized caching
  const { data: analyses = [], isLoading } = useQuery<AnalysisData[]>({
    queryKey: ["/api/admin/analyses"],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Enhanced filtering with memoization for performance
  const filteredAnalyses = useMemo(() => {
    let filtered = analyses;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(analysis => 
        analysis.fileName?.toLowerCase().includes(searchLower) ||
        analysis.user?.firstName?.toLowerCase().includes(searchLower) ||
        analysis.user?.lastName?.toLowerCase().includes(searchLower) ||
        analysis.user?.email?.toLowerCase().includes(searchLower) ||
        analysis.analysisResults?.summary?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.analysisType && filters.analysisType !== 'all') {
      filtered = filtered.filter(analysis => analysis.analysisType === filters.analysisType);
    }

    if (filters.severity && filters.severity !== 'all') {
      filtered = filtered.filter(analysis => 
        analysis.analysisResults?.rejectionReasons?.some(reason => 
          reason.severity === filters.severity
        )
      );
    }

    if (filters.isPublic && filters.isPublic !== 'all') {
      const isPublic = filters.isPublic === 'public';
      filtered = filtered.filter(analysis => analysis.isPublic === isPublic);
    }

    return filtered;
  }, [analyses, filters]);

  // Pagination logic
  const totalItems = filteredAnalyses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAnalyses = filteredAnalyses.slice(startIndex, startIndex + itemsPerPage);

  // Reset pagination when filters change
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const openAnalysisDetails = (analysis: AnalysisData) => {
    setSelectedAnalysis(analysis);
    setAnalysisDetailsOpen(true);
    setActiveTab('overview'); // Reset to overview tab
  };

  const closeAnalysisDetails = () => {
    setAnalysisDetailsOpen(false);
    setSelectedAnalysis(null);
    setActiveTab('overview');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          showPublicFilter
          showDateRange
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {paginatedAnalyses.length} of {totalItems} analyses
          </p>
        </div>

        {/* Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAnalyses.map((analysis) => (
            <Card key={analysis.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openAnalysisDetails(analysis)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg text-gray-900 truncate">{analysis.fileName}</CardTitle>
                  </div>
                  <Badge variant={analysis.isPublic ? "default" : "secondary"}>
                    {analysis.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {analysis.user ? `${analysis.user.firstName} ${analysis.user.lastName}` : 'Unknown User'}
                  </span>
                </div>

                {/* Analysis Type */}
                <div className="flex items-center gap-2">
                  <BadgeIcon className="h-4 w-4 text-gray-500" />
                  <Badge variant="outline">
                    {analysis.analysisType === 'enrollment_analysis' ? 'Enrollment' : 'Visa Analysis'}
                  </Badge>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(analysis.createdAt), "MMM dd, yyyy")}</span>
                </div>

                {/* Quick Stats */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    {analysis.analysisResults?.rejectionReasons?.length || 0} issues
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAnalyses.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Analysis Details Dialog */}
      {selectedAnalysis && (
        <Dialog open={analysisDetailsOpen} onOpenChange={setAnalysisDetailsOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeAnalysisDetails}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Analysis Report
                </DialogTitle>
              </div>
            </DialogHeader>
            
            {selectedAnalysis && (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  {/* Header Information Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Document Info */}
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Document Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="text-xs text-blue-600 font-medium">Filename</p>
                          <p className="text-sm text-blue-900 font-semibold">{selectedAnalysis.fileName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 font-medium">Type</p>
                          <Badge variant="outline" className="text-xs">
                            {selectedAnalysis.analysisType === 'enrollment_analysis' ? 'Enrollment Document' : 'Visa Document'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* User Info */}
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          User Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="text-xs text-green-600 font-medium">Name</p>
                          <p className="text-sm text-green-900 font-semibold">
                            {selectedAnalysis.user ? `${selectedAnalysis.user.firstName} ${selectedAnalysis.user.lastName}` : 'Unknown User'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-green-600 font-medium">Email</p>
                          <p className="text-xs text-green-800">{selectedAnalysis.user?.email || 'Not available'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Analysis Info */}
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Analysis Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="text-xs text-purple-600 font-medium">Date</p>
                          <p className="text-sm text-purple-900 font-semibold">{format(new Date(selectedAnalysis.createdAt), "PPP")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-purple-600 font-medium">Privacy</p>
                          <Badge variant={selectedAnalysis.isPublic ? "default" : "secondary"} className="text-xs">
                            {selectedAnalysis.isPublic ? "Public" : "Private"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabbed Content */}
                  <div className="mt-6">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8">
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
                        {selectedAnalysis.analysisResults?.rejectionReasons && selectedAnalysis.analysisResults.rejectionReasons.length > 0 && (
                          <button 
                            onClick={() => setActiveTab('issues')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === 'issues' 
                                ? 'border-red-500 text-red-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Issues Found
                          </button>
                        )}
                        {selectedAnalysis.analysisResults?.keyFindings && selectedAnalysis.analysisResults.keyFindings.length > 0 && (
                          <button 
                            onClick={() => setActiveTab('findings')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === 'findings' 
                                ? 'border-blue-500 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Key Findings
                          </button>
                        )}
                        {selectedAnalysis.analysisResults?.recommendations && selectedAnalysis.analysisResults.recommendations.length > 0 && (
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
                        {selectedAnalysis.analysisResults?.nextSteps && (
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
                            <Card className="mb-6">
                              <CardHeader>
                                <CardTitle className="text-xl text-gray-800">Document Summary</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div 
                                  className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                                  dangerouslySetInnerHTML={{ 
                                    __html: formatNumericalInfo(selectedAnalysis.analysisResults.summary) 
                                  }}
                                />
                              </CardContent>
                            </Card>
                          )}

                          {/* Complete Analysis Content Display */}
                          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                              <CardTitle className="flex items-center gap-2 text-gray-800">
                                <FileText className="h-5 w-5" />
                                Complete Analysis Results
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="bg-gray-50 p-6 rounded-lg border">
                                <div className="text-xs text-gray-500 mb-3 font-medium">ORIGINAL AI-GENERATED ANALYSIS CONTENT:</div>
                                <div 
                                  className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                                  dangerouslySetInnerHTML={{ 
                                    __html: formatNumericalInfo(JSON.stringify(selectedAnalysis.analysisResults, null, 2)) 
                                  }}
                                />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Structured Information Display for Enrollment Analysis */}
                          {selectedAnalysis.analysisType === 'enrollment_analysis' && (
                            <div className="space-y-6">
                              {/* Institution & Program Details */}
                              {((selectedAnalysis.analysisResults as any)?.institutionName || 
                                (selectedAnalysis.analysisResults as any)?.programName || 
                                (selectedAnalysis.analysisResults as any)?.studentName) && (
                                <Card>
                                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                    <CardTitle className="flex items-center gap-2 text-green-800">
                                      <GraduationCap className="h-5 w-5" />
                                      Academic Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-6 space-y-4">
                                    {(selectedAnalysis.analysisResults as any)?.institutionName && (
                                      <div>
                                        <span className="font-medium text-gray-600">Institution:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).institutionName) 
                                          }}
                                        />
                                      </div>
                                    )}
                                    {(selectedAnalysis.analysisResults as any)?.programName && (
                                      <div>
                                        <span className="font-medium text-gray-600">Program:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).programName) 
                                          }}
                                        />
                                      </div>
                                    )}
                                    {(selectedAnalysis.analysisResults as any)?.studentName && (
                                      <div>
                                        <span className="font-medium text-gray-600">Student:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).studentName) 
                                          }}
                                        />
                                      </div>
                                    )}
                                    {(selectedAnalysis.analysisResults as any)?.programLevel && (
                                      <div>
                                        <span className="font-medium text-gray-600">Level:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).programLevel) 
                                          }}
                                        />
                                      </div>
                                    )}
                                    {(selectedAnalysis.analysisResults as any)?.startDate && (
                                      <div>
                                        <span className="font-medium text-gray-600">Start Date:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).startDate) 
                                          }}
                                        />
                                      </div>
                                    )}
                                    {(selectedAnalysis.analysisResults as any)?.duration && (
                                      <div>
                                        <span className="font-medium text-gray-600">Duration:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).duration) 
                                          }}
                                        />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )}

                              {/* Financial Information */}
                              {((selectedAnalysis.analysisResults as any)?.tuitionFee || 
                                (selectedAnalysis.analysisResults as any)?.scholarship || 
                                (selectedAnalysis.analysisResults as any)?.totalCost ||
                                (selectedAnalysis.analysisResults as any)?.financialDetails) && (
                                <Card>
                                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                                    <CardTitle className="flex items-center gap-2 text-blue-800">
                                      <DollarSign className="h-5 w-5" />
                                      Financial Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-6 space-y-4">
                                    {(selectedAnalysis.analysisResults as any)?.tuitionFee && (
                                      <div>
                                        <span className="font-medium text-gray-600">Tuition Fee:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).tuitionFee) 
                                          }}
                                        />
                                      </div>
                                    )}
                                    {(selectedAnalysis.analysisResults as any)?.scholarship && (
                                      <div>
                                        <span className="font-medium text-gray-600">Scholarship:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).scholarship) 
                                          }}
                                        />
                                      </div>
                                    )}
                                    {(selectedAnalysis.analysisResults as any)?.totalCost && (
                                      <div>
                                        <span className="font-medium text-gray-600">Total Cost:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).totalCost) 
                                          }}
                                        />
                                      </div>
                                    )}
                                    {(selectedAnalysis.analysisResults as any)?.financialAid && (
                                      <div>
                                        <span className="font-medium text-gray-600">Financial Aid:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).financialAid) 
                                          }}
                                        />
                                      </div>
                                    )}
                                    {(selectedAnalysis.analysisResults as any)?.scholarshipPercentage && (
                                      <div>
                                        <span className="font-medium text-gray-600">Scholarship Coverage:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).scholarshipPercentage) 
                                          }}
                                        />
                                      </div>
                                    )}
                                    {(selectedAnalysis.analysisResults as any)?.semesterFee && (
                                      <div>
                                        <span className="font-medium text-gray-600">Semester Fee:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).semesterFee) 
                                          }}
                                        />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )}

                              {/* Analysis Scores & Confidence */}
                              {((selectedAnalysis.analysisResults as any)?.analysisScore || 
                                (selectedAnalysis.analysisResults as any)?.confidence) && (
                                <Card>
                                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                                    <CardTitle className="flex items-center gap-2 text-purple-800">
                                      <Info className="h-5 w-5" />
                                      Analysis Metrics
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-6 space-y-4">
                                    {(selectedAnalysis.analysisResults as any)?.analysisScore && (
                                      <div>
                                        <span className="font-medium text-gray-600">Analysis Score:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).analysisScore.toString()) 
                                          }}
                                        />
                                      </div>
                                    )}
                                    {(selectedAnalysis.analysisResults as any)?.confidence && (
                                      <div>
                                        <span className="font-medium text-gray-600">Confidence Level:</span>
                                        <div 
                                          className="text-gray-800 mt-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo((selectedAnalysis.analysisResults as any).confidence.toString()) 
                                          }}
                                        />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Issues Found Tab */}
                      {activeTab === 'issues' && (
                        <div className="space-y-6">
                          {selectedAnalysis.analysisResults?.rejectionReasons?.map((reason, index) => (
                            <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                  <h3 className="font-semibold text-lg text-gray-800">{reason.title}</h3>
                                  <Badge variant={reason.severity === 'high' ? 'destructive' : reason.severity === 'medium' ? 'default' : 'secondary'}>
                                    {reason.severity}
                                  </Badge>
                                </div>
                                <div 
                                  className="text-gray-700 leading-relaxed"
                                  dangerouslySetInnerHTML={{ 
                                    __html: formatNumericalInfo(reason.description) 
                                  }}
                                />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Key Findings Tab */}
                      {activeTab === 'findings' && (
                        <div className="space-y-6">
                          {selectedAnalysis.analysisResults?.keyFindings?.map((finding: any, index: number) => (
                            <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                  <h3 className="font-semibold text-lg text-gray-800">{finding.title}</h3>
                                  <Badge variant={finding.importance === 'high' ? 'destructive' : finding.importance === 'medium' ? 'default' : 'secondary'}>
                                    {finding.importance}
                                  </Badge>
                                </div>
                                <div 
                                  className="text-gray-700 leading-relaxed"
                                  dangerouslySetInnerHTML={{ 
                                    __html: formatNumericalInfo(finding.description) 
                                  }}
                                />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Recommendations Tab */}
                      {activeTab === 'recommendations' && (
                        <div className="space-y-6">
                          {selectedAnalysis.analysisResults?.recommendations?.map((recommendation, index) => (
                            <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                              <CardContent className="p-6">
                                <h3 className="font-semibold text-lg text-gray-800 mb-3">{recommendation.title}</h3>
                                <div 
                                  className="text-gray-700 leading-relaxed"
                                  dangerouslySetInnerHTML={{ 
                                    __html: formatNumericalInfo(recommendation.description) 
                                  }}
                                />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Next Steps Tab */}
                      {activeTab === 'next-steps' && (
                        <div className="space-y-6">
                          {Array.isArray(selectedAnalysis.analysisResults?.nextSteps) 
                            ? selectedAnalysis.analysisResults.nextSteps.map((step, index) => (
                                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                                  <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                      <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-gray-800 mb-3">
                                          {typeof step === 'string' ? `Step ${index + 1}` : (step as any).title}
                                        </h3>
                                        <div 
                                          className="text-gray-700 leading-relaxed"
                                          dangerouslySetInnerHTML={{ 
                                            __html: formatNumericalInfo(
                                              typeof step === 'string' ? step : (step as any).description
                                            ) 
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            : selectedAnalysis.analysisResults?.nextSteps && (
                                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                                  <CardContent className="p-6">
                                    <div 
                                      className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                                      dangerouslySetInnerHTML={{ 
                                        __html: formatNumericalInfo(selectedAnalysis.analysisResults.nextSteps) 
                                      }}
                                    />
                                  </CardContent>
                                </Card>
                              )
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}