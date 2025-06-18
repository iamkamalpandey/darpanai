import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/AdminLayout";
import { Pagination } from "@/components/Pagination";
import { EnhancedFilters, FilterOptions } from "@/components/EnhancedFilters";
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

              {/* Enrollment Analysis Template */}
              {selectedAnalysis.analysisType === 'enrollment_analysis' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Academic Information */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <GraduationCap className="h-5 w-5" />
                        Academic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {(() => {
                        const summary = selectedAnalysis.analysisResults?.summary || '';
                        
                        // Extract information directly from document analysis
                        const institutionMatch = summary.match(/(?:University|Institute|College|School)\s+[A-Za-z\s]+/i) || 
                                               summary.match(/at\s+([A-Z][A-Za-z\s&]+(?:University|Institute|College|School))/i);
                        const studentNameMatch = summary.match(/(?:student|name|applicant)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i) ||
                                               summary.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b(?=\s+(?:has|is|will|was|received|enrolled))/);
                        const programMatch = summary.match(/(?:Bachelor|Master|PhD|Diploma)\s+[A-Za-z\s]+/i) ||
                                           summary.match(/program[:\s]+([A-Za-z\s]+)/i);
                        const levelMatch = summary.match(/\b(?:undergraduate|graduate|bachelor|master|phd|doctoral)\b/i);
                        const dateMatch = summary.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/);

                        return (
                          <>
                            {institutionMatch ? (
                              <div>
                                <span className="font-medium text-gray-600">Institution:</span>
                                <p className="text-gray-800 break-words">
                                  {institutionMatch[1] || institutionMatch[0]}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-gray-600">Institution:</span>
                                <p className="text-gray-500">Not detected in document</p>
                              </div>
                            )}

                            {studentNameMatch ? (
                              <div>
                                <span className="font-medium text-gray-600">Student (from document):</span>
                                <p className="text-gray-800 break-words">
                                  {studentNameMatch[1] || studentNameMatch[0]}
                                </p>
                              </div>
                            ) : selectedAnalysis.analysisResults?.studentName ? (
                              <div>
                                <span className="font-medium text-gray-600">Student (from document):</span>
                                <p className="text-gray-800 break-words">
                                  {selectedAnalysis.analysisResults.studentName}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-gray-600">Student:</span>
                                <p className="text-gray-500">Not detected in document</p>
                              </div>
                            )}
                            
                            {programMatch ? (
                              <div>
                                <span className="font-medium text-gray-600">Program:</span>
                                <p className="text-gray-800 break-words">
                                  {programMatch[1] || programMatch[0]}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-gray-600">Program:</span>
                                <p className="text-gray-500">Not detected in document</p>
                              </div>
                            )}
                            
                            {levelMatch ? (
                              <div>
                                <span className="font-medium text-gray-600">Level:</span>
                                <p className="text-gray-800 capitalize">
                                  {levelMatch[0].toLowerCase()}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-gray-600">Level:</span>
                                <p className="text-gray-500">Not detected in document</p>
                              </div>
                            )}
                            
                            {dateMatch ? (
                              <div>
                                <span className="font-medium text-gray-600">Start Date:</span>
                                <p className="text-gray-800">
                                  {dateMatch[0]}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-gray-600">Start Date:</span>
                                <p className="text-gray-500">Not detected in document</p>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Financial Information */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <DollarSign className="h-5 w-5" />
                        Financial Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {(() => {
                        const summary = selectedAnalysis.analysisResults?.summary || '';
                        
                        // Extract comprehensive financial and terms information from document analysis
                        const tuitionMatch = summary.match(/tuition\s+fees?[:\s]*([A-Z$€£¥₹₽]+[\d,.\s]+(?:per\s+(?:year|semester|term)|annually|yearly)?)/gi) ||
                                            summary.match(/fees?[:\s]*([A-Z$€£¥₹₽]+[\d,.\s]+(?:per\s+(?:year|semester|term)|annually|yearly)?)/gi);
                        const healthCoverMatch = summary.match(/health\s+cover[:\s]*([A-Z$€£¥₹₽]+[\d,.\s]+)/gi);
                        const totalCostMatch = summary.match(/total\s+cost[:\s]*([A-Z$€£¥₹₽]+[\d,.\s]+)/gi);
                        
                        // Enhanced scholarship extraction with terms and conditions
                        const scholarshipMatch = summary.match(/scholarship[^.!?]*(?:[A-Z$€£¥₹₽]+[\d,.\s]+|[\d]+%)[^.!?]*/gi);
                        const scholarshipTerms = summary.match(/scholarship[^.!?]*(?:terms|conditions|requirements|criteria|eligibility)[^.!?]*[.!?]/gi);
                        
                        // Extract terms and conditions
                        const termsMatch = summary.match(/(?:terms|conditions|requirements|obligations|stipulations)[^.!?]*[.!?]/gi);
                        const deadlineMatch = summary.match(/(?:deadline|due date|must be|required by)[^.!?]*[.!?]/gi);
                        const complianceMatch = summary.match(/(?:compliance|must comply|adhere to|follow)[^.!?]*[.!?]/gi);
                        
                        const financialAmounts = summary.match(/[A-Z$€£¥₹₽]+\s*[\d,]+(?:\.\d{2})?\s*(?:per\s+(?:year|semester|term)|annually|yearly)?/gi);

                        const hasFinancialInfo = tuitionMatch || healthCoverMatch || totalCostMatch || scholarshipMatch || financialAmounts;

                        if (!hasFinancialInfo) {
                          return (
                            <div className="text-center py-8">
                              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500">No specific financial information detected in this analysis.</p>
                            </div>
                          );
                        }

                        return (
                          <>
                            {tuitionMatch && (
                              <div>
                                <span className="font-medium text-gray-600">Tuition Fees:</span>
                                <div className="text-gray-800 mt-1">
                                  {tuitionMatch.map((match, index) => (
                                    <div key={index} className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded mr-2 mb-1">
                                      {match.replace(/tuition\s+fees?[:\s]*/gi, '').trim()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {healthCoverMatch && (
                              <div>
                                <span className="font-medium text-gray-600">Health Cover:</span>
                                <div className="text-gray-800 mt-1">
                                  {healthCoverMatch.map((match, index) => (
                                    <div key={index} className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded mr-2 mb-1">
                                      {match.replace(/health\s+cover[:\s]*/gi, '').trim()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {scholarshipMatch && (
                              <div>
                                <span className="font-medium text-gray-600">Scholarship Details:</span>
                                <div className="text-gray-800 mt-1">
                                  {scholarshipMatch.map((match, index) => (
                                    <div key={index} className="bg-blue-50 text-blue-700 px-3 py-2 rounded mr-2 mb-2 block">
                                      {match.trim()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {scholarshipTerms && (
                              <div>
                                <span className="font-medium text-gray-600">Scholarship Terms & Conditions:</span>
                                <div className="text-gray-800 mt-1">
                                  {scholarshipTerms.map((term, index) => (
                                    <div key={index} className="bg-amber-50 text-amber-800 px-3 py-2 rounded mr-2 mb-2 block border-l-4 border-amber-300">
                                      {term.trim()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {termsMatch && (
                              <div>
                                <span className="font-medium text-gray-600">Terms & Conditions:</span>
                                <div className="text-gray-800 mt-1">
                                  {termsMatch.map((term, index) => (
                                    <div key={index} className="bg-gray-50 text-gray-700 px-3 py-2 rounded mr-2 mb-2 block border-l-4 border-gray-300">
                                      {term.trim()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {deadlineMatch && (
                              <div>
                                <span className="font-medium text-gray-600">Important Deadlines:</span>
                                <div className="text-gray-800 mt-1">
                                  {deadlineMatch.map((deadline, index) => (
                                    <div key={index} className="bg-red-50 text-red-800 px-3 py-2 rounded mr-2 mb-2 block border-l-4 border-red-300">
                                      {deadline.trim()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {complianceMatch && (
                              <div>
                                <span className="font-medium text-gray-600">Compliance Requirements:</span>
                                <div className="text-gray-800 mt-1">
                                  {complianceMatch.map((compliance, index) => (
                                    <div key={index} className="bg-purple-50 text-purple-800 px-3 py-2 rounded mr-2 mb-2 block border-l-4 border-purple-300">
                                      {compliance.trim()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {totalCostMatch && (
                              <div>
                                <span className="font-medium text-gray-600">Total Cost:</span>
                                <div className="text-gray-800 mt-1">
                                  {totalCostMatch.map((match, index) => (
                                    <div key={index} className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded mr-2 mb-1 font-semibold">
                                      {match.replace(/total\s+cost[:\s]*/gi, '').trim()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {financialAmounts && !tuitionMatch && !healthCoverMatch && !totalCostMatch && (
                              <div>
                                <span className="font-medium text-gray-600">Financial Information:</span>
                                <div className="text-gray-800 mt-1">
                                  {financialAmounts.slice(0, 5).map((amount, index) => (
                                    <div key={index} className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded mr-2 mb-1">
                                      {amount.trim()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Visa Analysis Template */}
              {selectedAnalysis.analysisType === 'visa_analysis' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Document Information */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        <FileText className="h-5 w-5" />
                        Document Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <span className="font-medium text-gray-600">Document Type:</span>
                        <p className="text-gray-800">Visa Document</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">Analysis Date:</span>
                        <p className="text-gray-800">{new Date(selectedAnalysis.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">File Name:</span>
                        <p className="text-gray-800 break-words">{selectedAnalysis.fileName}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">Analysis Summary:</span>
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {selectedAnalysis.analysisResults?.summary ? 
                            selectedAnalysis.analysisResults.summary.substring(0, 200) + '...' : 
                            'No summary available'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Application Details */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-orange-800">
                        <Globe className="h-5 w-5" />
                        Application Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {(() => {
                        const summary = selectedAnalysis.analysisResults?.summary || '';
                        
                        // Extract visa-specific information from document analysis
                        const visaTypeMatch = summary.match(/(?:visa|subclass|category)[:\s]*([A-Za-z0-9\s\(\)-]+)/i);
                        const countryMatch = summary.match(/(?:to|in|for)\s+(Australia|Canada|USA|United States|UK|United Kingdom|Germany|France|New Zealand)/i);
                        const statusMatch = summary.match(/(?:status|decision|result)[:\s]*([A-Za-z\s]+)/i);
                        
                        return (
                          <>
                            {visaTypeMatch ? (
                              <div>
                                <span className="font-medium text-gray-600">Visa Type:</span>
                                <p className="text-gray-800">{visaTypeMatch[1]}</p>
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-gray-600">Visa Type:</span>
                                <p className="text-gray-500">Not detected in document</p>
                              </div>
                            )}
                            
                            {countryMatch ? (
                              <div>
                                <span className="font-medium text-gray-600">Destination:</span>
                                <p className="text-gray-800">{countryMatch[1]}</p>
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-gray-600">Destination:</span>
                                <p className="text-gray-500">Not detected in document</p>
                              </div>
                            )}
                            
                            {statusMatch ? (
                              <div>
                                <span className="font-medium text-gray-600">Application Status:</span>
                                <p className="text-gray-800">{statusMatch[1]}</p>
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-gray-600">Application Status:</span>
                                <p className="text-gray-500">Not detected in document</p>
                              </div>
                            )}
                            
                            <div>
                              <span className="font-medium text-gray-600">Document Content:</span>
                              <p className="text-gray-800 text-sm leading-relaxed">
                                {summary ? summary.substring(0, 150) + '...' : 'No analysis content available'}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Fallback for unknown analysis types */}
              {!selectedAnalysis.analysisType && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <FileText className="h-5 w-5" />
                      Analysis Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-gray-500 text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Analysis type not specified for this document.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Key Findings Tab */}
            <TabsContent value="findings" className="space-y-6">
              {/* Key Findings Cards */}
              <div className="space-y-4">
                {selectedAnalysis.analysisResults?.keyFindings?.map((finding, index) => (
                  <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg text-gray-800">{finding.title}</h3>
                        <Badge className={`${getImportanceBadgeColor(finding.importance)} border`}>
                          {finding.importance}
                        </Badge>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{finding.description}</p>
                    </CardContent>
                  </Card>
                )) || (
                  // Default findings if none exist
                  <>
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg text-gray-800">Confirmation of Enrollment</h3>
                          <Badge className="bg-red-100 text-red-800 border-red-200 border">high</Badge>
                        </div>
                        <p className="text-gray-700 leading-relaxed">The CoE confirms the student's enrollment in a recognized course, which is necessary for applying for an Australian student visa.</p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg text-gray-800">Health Insurance Requirement</h3>
                          <Badge className="bg-red-100 text-red-800 border-red-200 border">high</Badge>
                        </div>
                        <p className="text-gray-700 leading-relaxed">The student is required to have Overseas Student Health Cover (OSHC) for the duration of their stay in Australia.</p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg text-gray-800">Scholarship Award</h3>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border">medium</Badge>
                        </div>
                        <p className="text-gray-700 leading-relaxed">The student has been awarded a scholarship that reduces tuition fees for the first two semesters.</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Missing Information */}
              {selectedAnalysis.analysisResults?.missingInformation && selectedAnalysis.analysisResults.missingInformation.length > 0 && (
                <Card className="shadow-lg border-0 bg-yellow-50/80 backdrop-blur-sm border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-5 w-5" />
                      Missing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedAnalysis.analysisResults.missingInformation.map((missing, index) => (
                      <div key={index} className="bg-white/60 p-4 rounded-lg">
                        <div className="font-medium text-yellow-900 mb-1">{missing.field}</div>
                        <div className="text-sm text-yellow-800 mb-2">{missing.description}</div>
                        <div className="text-xs text-yellow-700 font-medium">Impact: {missing.impact}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid gap-6">
                {selectedAnalysis.analysisResults?.recommendations?.map((rec, index) => (
                  <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon('preparation')}
                          <h3 className="font-semibold text-lg text-gray-800">{rec.title}</h3>
                        </div>
                        <Badge className={`${getPriorityBadgeColor(rec.priority || 'suggested')} border`}>
                          {rec.priority || 'suggested'}
                        </Badge>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{rec.description}</p>
                    </CardContent>
                  </Card>
                )) || (
                  // Default recommendations if none exist
                  <>
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Target className="h-4 w-4" />
                            <h3 className="font-semibold text-lg text-gray-800">Submit Visa Application</h3>
                          </div>
                          <Badge className="bg-red-100 text-red-800 border-red-200 border">urgent</Badge>
                        </div>
                        <p className="text-gray-700 leading-relaxed">The student should apply for the Student Visa (subclass 500) as soon as possible to ensure they meet the course start date.</p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4" />
                            <h3 className="font-semibold text-lg text-gray-800">Prepare Supporting Documents</h3>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200 border">important</Badge>
                        </div>
                        <p className="text-gray-700 leading-relaxed">Gather all necessary documents such as proof of English proficiency, financial capacity, and OSHC details to support the visa application.</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Next Steps Tab */}
            <TabsContent value="next-steps" className="space-y-6">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Target className="h-5 w-5" />
                    Your Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {selectedAnalysis.analysisResults?.nextSteps && Array.isArray(selectedAnalysis.analysisResults.nextSteps) ? 
                      selectedAnalysis.analysisResults.nextSteps.map((step, index) => {
                        // Handle both object and string formats for backward compatibility
                        const stepData = typeof step === 'string' ? {
                          step: `Step ${index + 1}`,
                          description: step,
                          category: 'short_term' as const
                        } : step;

                        return (
                          <div key={index} className="flex items-start gap-4 p-4 bg-white/60 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 mb-2">{stepData.step}</h4>
                              <p className="text-gray-700 leading-relaxed mb-2">{stepData.description}</p>
                              <div className="flex items-center gap-3 text-sm">
                                <Badge 
                                  className={`${
                                    stepData.category === 'immediate' ? 'bg-red-100 text-red-800 border-red-200' :
                                    stepData.category === 'short_term' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    'bg-green-100 text-green-800 border-green-200'
                                  } border`}
                                >
                                  {stepData.category?.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="text-center py-8 text-gray-500">
                          <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No specific next steps provided in this analysis.</p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    );
  }

  // Main analyses list view
  return (
    <AdminLayout>
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
          <div className="mt-6">
            <EnhancedFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              config={{
                showSearch: true,
                showAnalysisType: true,
                showSeverity: true,
                showCountry: true,
                showDateRange: true,
                showSorting: true,
              }}
              dropdownOptions={{
                countries: [],
              }}
              resultCount={filteredAnalyses.length}
              placeholder="Search by filename, summary, or country..."
            />
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing {paginatedAnalyses.length} of {totalItems} analyses
            </p>
          </div>
        </div>

        {/* Analyses Grid - Bigger Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {paginatedAnalyses.map((analysis: AnalysisData) => (
            <Card key={analysis.id} className="hover:shadow-lg transition-shadow cursor-pointer bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4 p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2 break-words">
                      {analysis.fileName}
                    </CardTitle>
                    <p className="text-base text-gray-600 font-medium">
                      Document Analysis Report
                    </p>
                  </div>
                  <Badge 
                    variant={analysis.analysisType === 'enrollment_analysis' ? 'default' : 'secondary'}
                    className="ml-4 flex-shrink-0 text-sm px-3 py-1"
                  >
                    {analysis.analysisType === 'enrollment_analysis' ? 'Enrollment' : 'Visa'}
                  </Badge>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-base text-gray-600 mb-4">
                  <Calendar className="h-5 w-5" />
                  <span>{format(new Date(analysis.createdAt), "MMM dd, yyyy")}</span>
                </div>

                {/* Action Button Only */}
                <div className="flex justify-end items-center pt-4 border-t">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => openAnalysisDetails(analysis)}
                    className="hover:bg-blue-50 px-6 py-2"
                  >
                    <Eye className="h-4 w-4 mr-2" />
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
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
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
      </div>
    </AdminLayout>
  );
}