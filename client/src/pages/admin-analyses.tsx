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
                  <User className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Student</span>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedAnalysis.user ? 
                    `${selectedAnalysis.user.firstName} ${selectedAnalysis.user.lastName}` : 
                    selectedAnalysis.analysisResults?.studentName || 'Not specified'}
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

              {/* Full-Width Analysis Details Card */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <GraduationCap className="h-5 w-5" />
                    Analysis Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedAnalysis.analysisResults?.institutionName && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="font-medium text-gray-600 block mb-2">Institution:</span>
                        <p className="text-gray-800 break-words">
                          {selectedAnalysis.analysisResults.institutionName}
                        </p>
                      </div>
                    )}
                    {selectedAnalysis.analysisResults?.programName && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="font-medium text-gray-600 block mb-2">Program:</span>
                        <p className="text-gray-800 break-words">
                          {selectedAnalysis.analysisResults.programName}
                        </p>
                      </div>
                    )}
                    {selectedAnalysis.analysisResults?.documentType && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="font-medium text-gray-600 block mb-2">Document Type:</span>
                        <p className="text-gray-800">{selectedAnalysis.analysisResults.documentType}</p>
                      </div>
                    )}
                    {selectedAnalysis.analysisResults?.studentName && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="font-medium text-gray-600 block mb-2">Student Name:</span>
                        <p className="text-gray-800">{selectedAnalysis.analysisResults.studentName}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="font-medium text-gray-600 block mb-2">Analysis Date:</span>
                      <p className="text-gray-800">{new Date(selectedAnalysis.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="font-medium text-gray-600 block mb-2">File Name:</span>
                      <p className="text-gray-800 break-words">{selectedAnalysis.fileName}</p>
                    </div>
                  </div>
                  
                  {!selectedAnalysis.analysisResults?.institutionName && 
                   !selectedAnalysis.analysisResults?.programName && 
                   !selectedAnalysis.analysisResults?.documentType && (
                    <div className="text-gray-500 text-center py-8">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No detailed analysis information available for this document.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                        // Default next steps if none exist
                        <>
                          <div className="flex items-start gap-4 p-4 bg-white/60 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                              1
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 mb-2">Apply for Student Visa</h4>
                              <p className="text-gray-700 leading-relaxed mb-2">Visit the Australian Government Department of Home Affairs website to lodge the visa application online, ensuring all required documents are attached.</p>
                              <div className="flex items-center gap-3 text-sm">
                                <Badge className="bg-red-100 text-red-800 border-red-200 border">immediate</Badge>
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  As soon as possible, ideally within the next month.
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-4 p-4 bg-white/60 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                              2
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 mb-2">Arrange Accommodation</h4>
                              <p className="text-gray-700 leading-relaxed mb-2">Start looking for accommodation options in Australia, as securing a place to stay is essential before arrival.</p>
                              <div className="flex items-center gap-3 text-sm">
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border">short term</Badge>
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  By June 2025
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
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

        {/* Analyses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAnalyses.map((analysis: AnalysisData) => (
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