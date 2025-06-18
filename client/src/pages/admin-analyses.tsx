import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/AdminLayout";
import { Pagination } from "@/components/Pagination";
import { EnhancedFilters, FilterOptions } from "@/components/EnhancedFilters";
import { EnrollmentAnalysisDisplay } from "@/components/EnrollmentAnalysisDisplay";
import { 
  FileText, 
  User, 
  Calendar, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  GraduationCap, 
  DollarSign,
  TrendingUp,
  Building2,
  Globe,
  Target,
  AlertCircle
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
      priority?: 'urgent' | 'important' | 'suggested';
    }>;
    nextSteps?: Array<{
      title: string;
      description: string;
      category?: 'immediate' | 'short_term' | 'long_term';
      step?: string;
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
  };

  // Filter analyses based on current filters
  const filteredAnalyses = useMemo(() => {
    let filtered = (analyses as AnalysisData[]) || [];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter((analysis: AnalysisData) => 
        analysis.fileName?.toLowerCase().includes(searchTerm) ||
        analysis.user?.firstName?.toLowerCase().includes(searchTerm) ||
        analysis.user?.lastName?.toLowerCase().includes(searchTerm) ||
        analysis.user?.email?.toLowerCase().includes(searchTerm) ||
        analysis.user?.username?.toLowerCase().includes(searchTerm) ||
        analysis.analysisResults?.summary?.toLowerCase().includes(searchTerm) ||
        analysis.analysisResults?.institutionName?.toLowerCase().includes(searchTerm) ||
        analysis.analysisResults?.programName?.toLowerCase().includes(searchTerm) ||
        JSON.stringify(analysis.analysisResults?.keyFindings || []).toLowerCase().includes(searchTerm) ||
        JSON.stringify(analysis.analysisResults?.rejectionReasons || []).toLowerCase().includes(searchTerm)
      );
    }

    // Analysis type filter
    if (filters.analysisType && filters.analysisType !== 'all') {
      filtered = filtered.filter((analysis: AnalysisData) => analysis.analysisType === filters.analysisType);
    }

    // Severity filter (for visa analyses)
    if (filters.severity && filters.severity !== 'all') {
      filtered = filtered.filter((analysis: AnalysisData) => 
        analysis.analysisResults?.rejectionReasons?.some((reason: any) => 
          reason.severity === filters.severity
        ) ||
        analysis.analysisResults?.keyFindings?.some((finding: any) => 
          finding.importance === filters.severity
        )
      );
    }

    // Country filter (search in institution name)
    if (filters.country && filters.country !== 'all') {
      filtered = filtered.filter((analysis: AnalysisData) => 
        analysis.analysisResults?.institutionName?.toLowerCase().includes(filters.country!.toLowerCase())
      );
    }

    // Public/Private filter
    if (filters.isPublic !== null && filters.isPublic !== undefined) {
      filtered = filtered.filter((analysis: AnalysisData) => analysis.isPublic === filters.isPublic);
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          filterDate.setFullYear(1970); // Show all
      }
      
      filtered = filtered.filter((analysis: AnalysisData) => 
        new Date(analysis.createdAt) >= filterDate
      );
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a: AnalysisData, b: AnalysisData) => {
        let aValue, bValue;
        
        switch (filters.sortBy) {
          case 'date-desc':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'date-asc':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'name-asc':
            aValue = a.fileName?.toLowerCase() || '';
            bValue = b.fileName?.toLowerCase() || '';
            return aValue.localeCompare(bValue);
          case 'name-desc':
            aValue = a.fileName?.toLowerCase() || '';
            bValue = b.fileName?.toLowerCase() || '';
            return bValue.localeCompare(aValue);
          case 'user-asc':
            aValue = `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase();
            bValue = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase();
            return aValue.localeCompare(bValue);
          case 'user-desc':
            aValue = `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase();
            bValue = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase();
            return bValue.localeCompare(aValue);
          case 'type-asc':
            aValue = a.analysisType || '';
            bValue = b.analysisType || '';
            return aValue.localeCompare(bValue);
          case 'type-desc':
            aValue = a.analysisType || '';
            bValue = b.analysisType || '';
            return bValue.localeCompare(aValue);
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
    } else {
      // Default sort by date descending
      filtered.sort((a: AnalysisData, b: AnalysisData) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
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

  // Helper functions for badge colors
  const getImportanceBadgeColor = (importance: 'high' | 'medium' | 'low') => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityBadgeColor = (priority: 'urgent' | 'important' | 'suggested') => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'suggested': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documentation': return <FileText className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'academic': return <GraduationCap className="h-4 w-4" />;
      case 'visa': return <Globe className="h-4 w-4" />;
      case 'preparation': return <Target className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading analyses...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error loading analyses</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Analysis details view - exactly like user dashboard enrollment analysis
  if (selectedAnalysis) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {selectedAnalysis.analysisType === 'enrollment_analysis' ? 'Enrollment Analysis Results' : 'Visa Analysis Results'}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base break-words">{selectedAnalysis.fileName}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSelectedAnalysis(null)}
              className="w-full sm:w-auto"
            >
              ← Back to My Analysis
            </Button>
          </div>
          
          {/* Header Info Cards - Show actual data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">
                    {selectedAnalysis.analysisType === 'enrollment_analysis' ? 'Institution' : 'Document Type'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 break-words">
                  {selectedAnalysis.analysisResults?.institutionName || 
                   selectedAnalysis.analysisResults?.documentType || 
                   'Not specified'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Analysis Date</span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(selectedAnalysis.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">
                    {selectedAnalysis.analysisType === 'enrollment_analysis' ? 'Program' : 'Analysis Type'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedAnalysis.analysisResults?.programName || 
                   (selectedAnalysis.analysisType === 'visa_analysis' ? 'Visa Analysis' : 'Enrollment Analysis')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs - Exactly like user dashboard */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Overview</TabsTrigger>
              <TabsTrigger value="findings" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Key Findings</TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Recommendations</TabsTrigger>
              <TabsTrigger value="next-steps" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Next Steps</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Document Summary */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="text-xl text-gray-800">Document Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div 
                    className="whitespace-pre-wrap text-gray-700 leading-relaxed break-words"
                    dangerouslySetInnerHTML={{ 
                      __html: formatNumericalInfo(selectedAnalysis.analysisResults?.summary || 'No summary available for this analysis.') 
                    }}
                  />
                </CardContent>
              </Card>



              {/* Visa Analysis Template */}
              {selectedAnalysis.analysisType === 'visa_analysis' && (
                <div className="space-y-6">
                  {/* Key Findings */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-5 w-5" />
                        Analysis Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {selectedAnalysis.analysisResults?.rejectionReasons?.length > 0 ? (
                        <div className="space-y-4">
                          {selectedAnalysis.analysisResults.rejectionReasons.map((reason: any, index: number) => (
                            <div key={index} className="border-l-4 border-red-400 pl-4 py-2">
                              <h4 className="font-medium text-red-800">{reason.title}</h4>
                              <p className="text-gray-700 mt-1">{reason.description}</p>
                              {reason.category && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {reason.category}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No specific issues identified in this analysis.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Missing Information */}
                  {selectedAnalysis.analysisResults?.missingInformation && selectedAnalysis.analysisResults.missingInformation.length > 0 && (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-t-lg">
                        <CardTitle className="flex items-center gap-2 text-yellow-800">
                          <AlertCircle className="h-5 w-5" />
                          Missing Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          {selectedAnalysis.analysisResults.missingInformation.map((missing: any, index: number) => (
                            <div key={index} className="border-l-4 border-yellow-400 pl-4 py-2">
                              <h4 className="font-medium text-yellow-800">{missing.field}</h4>
                              <p className="text-gray-700 mt-1">{missing.description}</p>
                              <p className="text-sm text-gray-600 mt-1">Impact: {missing.impact}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recommendations */}
                  {selectedAnalysis.analysisResults?.recommendations && selectedAnalysis.analysisResults.recommendations.length > 0 && (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                        <CardTitle className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-5 w-5" />
                          Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {selectedAnalysis.analysisResults.recommendations.map((rec: any, index: number) => (
                            <div key={index} className="border-l-4 border-green-400 pl-4 py-2">
                              <h4 className="font-medium text-green-800">{rec.title}</h4>
                              <p className="text-gray-700 mt-1">{rec.description}</p>
                              {rec.priority && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {rec.priority}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Next Steps */}
                  {selectedAnalysis.analysisResults?.nextSteps && (
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
                        <CardTitle className="flex items-center gap-2 text-purple-800">
                          <TrendingUp className="h-5 w-5" />
                          Next Steps
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {Array.isArray(selectedAnalysis.analysisResults.nextSteps) ? (
                          <div className="space-y-3">
                            {selectedAnalysis.analysisResults.nextSteps.map((step: any, index: number) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium text-purple-800">{step.title || step.step}</h4>
                                  <p className="text-gray-700">{step.description}</p>
                                  {step.category && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {step.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-700">{selectedAnalysis.analysisResults.nextSteps}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-end mt-6">
        <Button
          variant="outline"
          onClick={() => setSelectedAnalysis(null)}
        >
          Back to Analysis List
        </Button>
      </div>
    </AdminLayout>
  );
}

function AnalysisDetailView({ analysis, onBack }: { analysis: AnalysisData; onBack: () => void }) {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600 mt-2">{analysis.fileName}</p>
            </div>
            <Button variant="outline" onClick={onBack}>
              Back to List
            </Button>
          </div>
        </div>

        {/* Metadata Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <FileText className="h-5 w-5" />
                Analysis Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <span className="font-medium text-gray-600">File Name:</span>
                <p className="text-gray-800">{analysis.fileName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Analysis Type:</span>
                <p className="text-gray-800">{analysis.analysisType === 'enrollment_analysis' ? 'Enrollment Analysis' : 'Visa Analysis'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <p className="text-gray-800">{format(new Date(analysis.createdAt), 'PPp')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">User:</span>
                <p className="text-gray-800">{analysis.user ? `${analysis.user.firstName} ${analysis.user.lastName}` : 'Unknown User'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <BarChart className="h-5 w-5" />
                Analysis Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <span className="font-medium text-gray-600">Public:</span>
                <p className="text-gray-800">{analysis.isPublic ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Content */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <FileText className="h-5 w-5" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Summary */}
            {analysis.analysisResults?.summary && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-400 pl-4">Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.analysisResults.summary}</p>
                </div>
              </div>
            )}

            {/* Key Findings */}
            {analysis.analysisResults?.keyFindings && analysis.analysisResults.keyFindings.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-red-400 pl-4">Key Findings</h3>
                <div className="space-y-3">
                  {analysis.analysisResults.keyFindings.map((finding, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-200">
                      <h4 className="font-medium text-gray-800 mb-2">{finding.title}</h4>
                      <p className="text-gray-700 leading-relaxed">{finding.description}</p>
                      {finding.importance && (
                        <Badge className={`mt-2 ${
                          finding.importance === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                          finding.importance === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        } border`}>
                          {finding.importance}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.analysisResults?.recommendations && analysis.analysisResults.recommendations.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-green-400 pl-4">Recommendations</h3>
                <div className="space-y-3">
                  {analysis.analysisResults.recommendations.map((rec, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-200">
                      <h4 className="font-medium text-gray-800 mb-2">{rec.title}</h4>
                      <p className="text-gray-700 leading-relaxed">{rec.description}</p>
                      {rec.priority && (
                        <Badge className={`mt-2 ${
                          rec.priority === 'urgent' ? 'bg-red-100 text-red-800 border-red-200' :
                          rec.priority === 'important' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        } border`}>
                          {rec.priority}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {analysis.analysisResults?.nextSteps && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-purple-400 pl-4">Next Steps</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {Array.isArray(analysis.analysisResults.nextSteps) ? (
                    <div className="space-y-3">
                      {analysis.analysisResults.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            {typeof step === 'string' ? (
                              <p className="text-gray-700 leading-relaxed">{step}</p>
                            ) : (
                              <>
                                <h4 className="font-medium text-gray-800 mb-1">{step.step || step.title}</h4>
                                <p className="text-gray-700 leading-relaxed">{step.description}</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.analysisResults.nextSteps}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function AdminAnalyses() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    analysisType: undefined,
    severity: undefined,
    country: undefined,
    dateRange: undefined,
    isPublic: undefined,
    sortBy: 'date-desc'
  });

  const { data: analyses, isLoading, error } = useQuery({
    queryKey: ['/api/admin/analyses'],
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const openAnalysisDetails = (analysis: AnalysisData) => {
    setSelectedAnalysis(analysis);
  };

  if (selectedAnalysis) {
    return <AnalysisDetailView analysis={selectedAnalysis} onBack={() => setSelectedAnalysis(null)} />;
  }

  // Filter and sort analyses
  let filtered = analyses || [];
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((analysis: AnalysisData) => 
      analysis.fileName?.toLowerCase().includes(searchLower) ||
      analysis.analysisResults?.summary?.toLowerCase().includes(searchLower) ||
      analysis.user?.username?.toLowerCase().includes(searchLower) ||
      analysis.user?.email?.toLowerCase().includes(searchLower)
    );
  }

  if (filters.analysisType) {
    filtered = filtered.filter((analysis: AnalysisData) => analysis.analysisType === filters.analysisType);
  }

  if (filters.severity) {
    filtered = filtered.filter((analysis: AnalysisData) => 
      analysis.analysisResults?.rejectionReasons?.some((reason: any) => reason.severity === filters.severity)
    );
  }

  if (filters.isPublic !== undefined) {
    filtered = filtered.filter((analysis: AnalysisData) => analysis.isPublic === filters.isPublic);
  }

  if (filters.country) {
    filtered = filtered.filter((analysis: AnalysisData) => 
      analysis.analysisResults?.summary?.toLowerCase().includes(filters.country.toLowerCase())
    );
  }

  // Sort analyses
  if (filters.sortBy) {
    filtered.sort((a: AnalysisData, b: AnalysisData) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name-asc':
          return (a.fileName || '').localeCompare(b.fileName || '');
        case 'name-desc':
          return (b.fileName || '').localeCompare(a.fileName || '');
        case 'type-asc':
          return (a.analysisType || '').localeCompare(b.analysisType || '');
        case 'type-desc':
          return (b.analysisType || '').localeCompare(a.analysisType || '');
        case 'user-asc':
          return (a.user?.username || '').localeCompare(b.user?.username || '');
        case 'user-desc':
          return (b.user?.username || '').localeCompare(a.user?.username || '');
        default:
          return 0;
      }
    });
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAnalyses = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">Analysis Reports</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Monitor and review all user analysis reports with detailed insights.
            </p>
          </div>
        </div>

        {/* Enhanced Filters */}
        <EnhancedFilters
          onFiltersChange={handleFiltersChange}
          analyses={analyses || []}
          showAnalysisTypeFilter={true}
          showSeverityFilter={true}
          showPublicFilter={true}
          initialFilters={filters}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Analyses</p>
                  <p className="text-xl font-bold">{totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Unique Users</p>
                  <p className="text-xl font-bold">
                    {new Set(filtered.map((a: AnalysisData) => a.userId)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Visa Analysis</p>
                  <p className="text-xl font-bold">
                    {filtered.filter((a: AnalysisData) => a.analysisType === 'visa_analysis').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Enrollment Analysis</p>
                  <p className="text-xl font-bold">
                    {filtered.filter((a: AnalysisData) => a.analysisType === 'enrollment_analysis').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Cards */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading analyses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load analyses. Please try again.</p>
          </div>
        ) : paginatedAnalyses.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No analyses found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAnalyses.map((analysis: AnalysisData) => (
              <Card
                key={analysis.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => openAnalysisDetails(analysis)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate">
                        {analysis.fileName}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={analysis.analysisType === 'visa_analysis' ? 'destructive' : 'default'}>
                          {analysis.analysisType === 'visa_analysis' ? 'Visa' : 'Enrollment'}
                        </Badge>
                        <Badge variant={analysis.isPublic ? 'outline' : 'secondary'}>
                          {analysis.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    </div>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-3 w-3" />
                      <span className="truncate">
                        {analysis.user ? `${analysis.user.username} (${analysis.user.email})` : 'Unknown User'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(analysis.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    
                    {analysis.analysisResults?.summary && (
                      <p className="text-gray-600 text-xs line-clamp-2 mt-2">
                        {analysis.analysisResults.summary.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Analysis Detail View Component
function AnalysisDetailView({ analysis, onBack }: { analysis: AnalysisData; onBack: () => void }) {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">Analysis Report</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Comprehensive analysis details and insights.
            </p>
          </div>
          <Button variant="outline" onClick={onBack}>
            Back to Analysis List
          </Button>
        </div>

        {/* Analysis Overview */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="text-xl text-gray-800">Analysis Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="font-medium text-gray-600">File Name:</span>
                <p className="text-gray-800">{analysis.fileName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Analysis Type:</span>
                <p className="text-gray-800 capitalize">{analysis.analysisType?.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">User:</span>
                <p className="text-gray-800">
                  {analysis.user ? `${analysis.user.username} (${analysis.user.email})` : 'Unknown User'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <p className="text-gray-800">{format(new Date(analysis.createdAt), 'MMMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Visibility:</span>
                <Badge variant={analysis.isPublic ? 'outline' : 'secondary'}>
                  {analysis.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Summary */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="text-xl text-gray-800">Document Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div 
              className="whitespace-pre-wrap text-gray-700 leading-relaxed break-words"
              dangerouslySetInnerHTML={{ 
                __html: formatNumericalInfo(analysis.analysisResults?.summary || 'No summary available for this analysis.') 
              }}
            />
          </CardContent>
        </Card>

        {/* Enrollment Analysis Template */}
        {analysis.analysisType === 'enrollment_analysis' && (
          <EnrollmentAnalysisDisplay 
            analysis={{
              id: analysis.id,
              fileName: analysis.fileName,
              createdAt: analysis.createdAt,
              institution: analysis.analysisResults?.institutionName,
              program: analysis.analysisResults?.programName,
              studentName: analysis.analysisResults?.studentName,
              programLevel: analysis.analysisResults?.programLevel,
              startDate: analysis.analysisResults?.startDate,
              endDate: analysis.analysisResults?.endDate,
              institutionCountry: analysis.analysisResults?.institutionCountry,
              visaType: analysis.analysisResults?.visaType,
              healthCover: analysis.analysisResults?.healthCover,
              englishTestScore: analysis.analysisResults?.englishTestScore,
              institutionContact: analysis.analysisResults?.institutionContact,
              visaObligations: analysis.analysisResults?.visaObligations,
              orientationDate: analysis.analysisResults?.orientationDate,
              passportDetails: analysis.analysisResults?.passportDetails,
              supportServices: analysis.analysisResults?.supportServices,
              paymentSchedule: analysis.analysisResults?.paymentSchedule,
              bankDetails: analysis.analysisResults?.bankDetails,
              conditionsOfOffer: analysis.analysisResults?.conditionsOfOffer,
              scholarshipDetails: analysis.analysisResults?.scholarshipDetails,
              scholarshipPercentage: analysis.analysisResults?.scholarshipPercentage,
              scholarshipDuration: analysis.analysisResults?.scholarshipDuration,
              scholarshipConditions: analysis.analysisResults?.scholarshipConditions,
              internshipRequired: analysis.analysisResults?.internshipRequired,
              internshipDuration: analysis.analysisResults?.internshipDuration,
              workAuthorization: analysis.analysisResults?.workAuthorization,
              workHoursLimit: analysis.analysisResults?.workHoursLimit,
              academicRequirements: analysis.analysisResults?.academicRequirements,
              gpaRequirement: analysis.analysisResults?.gpaRequirement,
              attendanceRequirement: analysis.analysisResults?.attendanceRequirement,
              languageRequirements: analysis.analysisResults?.languageRequirements,
              graduationRequirements: analysis.analysisResults?.graduationRequirements,
              termsToFulfil: analysis.analysisResults?.termsToFulfil,
              summary: analysis.analysisResults?.summary,
              keyFindings: analysis.analysisResults?.keyFindings,
              recommendations: analysis.analysisResults?.recommendations,
              missingInformation: analysis.analysisResults?.missingInformation
            }}
            isAdmin={true}
          />
        )}

        {/* Visa Analysis Template */}
        {analysis.analysisType === 'visa_analysis' && (
          <div className="space-y-6">
            {/* Key Findings */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analysis.analysisResults?.rejectionReasons?.length > 0 ? (
                  <div className="space-y-4">
                    {analysis.analysisResults.rejectionReasons.map((reason: any, index: number) => (
                      <div key={index} className="border-l-4 border-red-400 pl-4 py-2">
                        <h4 className="font-medium text-red-800">{reason.title}</h4>
                        <p className="text-gray-700 mt-1">{reason.description}</p>
                        {reason.category && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {reason.category}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No specific issues identified in this analysis.</p>
                )}
              </CardContent>
            </Card>

            {/* Missing Information */}
            {analysis.analysisResults?.missingInformation && analysis.analysisResults.missingInformation.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-5 w-5" />
                    Missing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {analysis.analysisResults.missingInformation.map((missing: any, index: number) => (
                      <div key={index} className="border-l-4 border-yellow-400 pl-4 py-2">
                        <h4 className="font-medium text-yellow-800">{missing.field}</h4>
                        <p className="text-gray-700 mt-1">{missing.description}</p>
                        <p className="text-sm text-gray-600 mt-1">Impact: {missing.impact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysis.analysisResults?.recommendations && analysis.analysisResults.recommendations.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {analysis.analysisResults.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="border-l-4 border-green-400 pl-4 py-2">
                        <h4 className="font-medium text-green-800">{rec.title}</h4>
                        <p className="text-gray-700 mt-1">{rec.description}</p>
                        {rec.priority && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {rec.priority}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            {analysis.analysisResults?.nextSteps && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <TrendingUp className="h-5 w-5" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {Array.isArray(analysis.analysisResults.nextSteps) ? (
                    <div className="space-y-3">
                      {analysis.analysisResults.nextSteps.map((step: any, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-800">{step.title || step.step}</h4>
                            <p className="text-gray-700">{step.description}</p>
                            {step.category && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {step.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700">{analysis.analysisResults.nextSteps}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Helper function to format numerical information with blue highlighting
function formatNumericalInfo(text: string): string {
  return text.replace(
    /(\$[0-9,]+(?:\.[0-9]{2})?|\b[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?\s*(?:USD|CAD|EUR|GBP|AUD|₹|%)|[0-9]+\s*(?:years?|months?|semesters?|credits?|hours?|weeks?)|[0-9]+(?:\.[0-9]+)?\s*(?:GPA|CGPA|IELTS|TOEFL))/gi,
    '<span class="bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-medium">$1</span>'
  );
}