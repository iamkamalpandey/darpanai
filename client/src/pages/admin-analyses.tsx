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

              {/* Enrollment Analysis Template */}
              {selectedAnalysis.analysisType === 'enrollment_analysis' && (
                <EnrollmentAnalysisDisplay 
                  analysis={{
                    id: selectedAnalysis.id,
                    fileName: selectedAnalysis.filename,
                    createdAt: selectedAnalysis.createdAt,
                    institution: selectedAnalysis.analysisResults?.institution,
                    program: selectedAnalysis.analysisResults?.program,
                    studentName: selectedAnalysis.analysisResults?.studentName,
                    programLevel: selectedAnalysis.analysisResults?.programLevel,
                    startDate: selectedAnalysis.analysisResults?.startDate,
                    endDate: selectedAnalysis.analysisResults?.endDate,
                    institutionCountry: selectedAnalysis.analysisResults?.institutionCountry,
                    visaType: selectedAnalysis.analysisResults?.visaType,
                    healthCover: selectedAnalysis.analysisResults?.healthCover,
                    englishTestScore: selectedAnalysis.analysisResults?.englishTestScore,
                    institutionContact: selectedAnalysis.analysisResults?.institutionContact,
                    visaObligations: selectedAnalysis.analysisResults?.visaObligations,
                    orientationDate: selectedAnalysis.analysisResults?.orientationDate,
                    passportDetails: selectedAnalysis.analysisResults?.passportDetails,
                    supportServices: selectedAnalysis.analysisResults?.supportServices,
                    paymentSchedule: selectedAnalysis.analysisResults?.paymentSchedule,
                    bankDetails: selectedAnalysis.analysisResults?.bankDetails,
                    conditionsOfOffer: selectedAnalysis.analysisResults?.conditionsOfOffer,
                    scholarshipDetails: selectedAnalysis.analysisResults?.scholarshipDetails,
                    scholarshipPercentage: selectedAnalysis.analysisResults?.scholarshipPercentage,
                    scholarshipDuration: selectedAnalysis.analysisResults?.scholarshipDuration,
                    scholarshipConditions: selectedAnalysis.analysisResults?.scholarshipConditions,
                    internshipRequired: selectedAnalysis.analysisResults?.internshipRequired,
                    internshipDuration: selectedAnalysis.analysisResults?.internshipDuration,
                    workAuthorization: selectedAnalysis.analysisResults?.workAuthorization,
                    workHoursLimit: selectedAnalysis.analysisResults?.workHoursLimit,
                    academicRequirements: selectedAnalysis.analysisResults?.academicRequirements,
                    gpaRequirement: selectedAnalysis.analysisResults?.gpaRequirement,
                    attendanceRequirement: selectedAnalysis.analysisResults?.attendanceRequirement,
                    languageRequirements: selectedAnalysis.analysisResults?.languageRequirements,
                    graduationRequirements: selectedAnalysis.analysisResults?.graduationRequirements,
                    termsToFulfil: selectedAnalysis.analysisResults?.termsToFulfil,
                    summary: selectedAnalysis.analysisResults?.summary,
                    keyFindings: selectedAnalysis.analysisResults?.keyFindings,
                    recommendations: selectedAnalysis.analysisResults?.recommendations,
                    missingInformation: selectedAnalysis.analysisResults?.missingInformation
                  }}
                  isAdmin={true}
                />
              )}

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
      )}

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