import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Pagination } from '@/components/Pagination';
import { EnhancedFilters, FilterOptions, searchInText, filterByDateRange } from '@/components/EnhancedFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, GraduationCap, Calendar, User, Building2, Globe, AlertTriangle, TrendingUp, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

interface Analysis {
  id: number;
  filename: string;
  type: 'visa_rejection' | 'enrollment';
  createdAt: string;
  // Visa rejection fields
  rejectionReasons?: Array<{
    title: string;
    description: string;
    category?: string;
    severity?: string;
  }>;
  // Enrollment analysis fields
  institutionCountry?: string;
  studentCountry?: string;
  visaType?: string;
  summary?: string;
}

interface AnalysisDetail {
  id: number;
  filename: string;
  createdAt: string;
  analysisResults?: any;
  summary?: string;
  country?: string;
  visaType?: string;
  isPublic?: boolean;
  institutionCountry?: string;
  studentCountry?: string;
}

export default function AnalysisHub() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<{id: number, type: 'visa_rejection' | 'enrollment'} | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Fetch visa rejection analyses
  const { data: visaAnalyses = [] } = useQuery<Analysis[]>({
    queryKey: ['/api/analyses'],
    select: (data) => data.map(item => ({ ...item, type: 'visa_rejection' as const }))
  });

  // Fetch enrollment analyses
  const { data: enrollmentAnalyses = [] } = useQuery<Analysis[]>({
    queryKey: ['/api/enrollment-analyses'],
    select: (data) => data.map(item => ({ ...item, type: 'enrollment' as const }))
  });

  // Fetch detailed analysis when selected
  const { data: analysisDetail, isLoading: detailLoading } = useQuery<AnalysisDetail>({
    queryKey: [
      selectedAnalysis?.type === 'visa_rejection' ? '/api/analyses' : '/api/enrollment-analyses',
      selectedAnalysis?.id
    ],
    enabled: !!selectedAnalysis,
    select: (data) => {
      const analysis = Array.isArray(data) ? data[0] : data;
      return analysis;
    }
  });

  // Handle viewing analysis inline
  const viewAnalysis = (id: number, type: 'visa_rejection' | 'enrollment') => {
    setSelectedAnalysis({ id, type });
  };

  const backToList = () => {
    setSelectedAnalysis(null);
  };

  // Combine all analyses
  const allAnalyses = [...visaAnalyses, ...enrollmentAnalyses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Memoized filtered analyses for performance
  const filteredAnalyses = useMemo(() => {
    let filtered = allAnalyses;

    // Text search across multiple fields
    if (filters.searchTerm) {
      filtered = filtered.filter(analysis => 
        searchInText(analysis.filename, filters.searchTerm) ||
        searchInText(analysis.summary, filters.searchTerm) ||
        searchInText(analysis.institutionCountry, filters.searchTerm) ||
        searchInText(analysis.studentCountry, filters.searchTerm) ||
        searchInText(analysis.visaType, filters.searchTerm)
      );
    }

    // Filter by analysis type
    if (filters.analysisType) {
      filtered = filtered.filter(analysis => analysis.type === filters.analysisType);
    }

    // Filter by country (for enrollment analyses)
    if (filters.country) {
      filtered = filtered.filter(analysis => 
        analysis.institutionCountry === filters.country ||
        analysis.studentCountry === filters.country
      );
    }

    // Filter by date range
    if (filters.dateRange) {
      filtered = filterByDateRange(filtered, filters.dateRange, 'createdAt');
    }

    return filtered;
  }, [allAnalyses, filters]);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAnalyses = filteredAnalyses.slice(startIndex, endIndex);

  // Separate filtered analyses by type for tabs
  const filteredVisaAnalyses = filteredAnalyses.filter(a => a.type === 'visa_rejection');
  const filteredEnrollmentAnalyses = filteredAnalyses.filter(a => a.type === 'enrollment');

  // Pagination for individual tabs
  const paginatedVisaAnalyses = filteredVisaAnalyses.slice(startIndex, endIndex);
  const paginatedEnrollmentAnalyses = filteredEnrollmentAnalyses.slice(startIndex, endIndex);

  const getAnalysisIcon = (type: string) => {
    return type === 'visa_rejection' ? (
      <AlertTriangle className="h-5 w-5 text-red-600" />
    ) : (
      <GraduationCap className="h-5 w-5 text-blue-600" />
    );
  };

  const getAnalysisTypeLabel = (type: string) => {
    return type === 'visa_rejection' ? 'Visa Analysis' : 'Enrollment Analysis';
  };

  const getAnalysisTypeBadge = (type: string) => {
    return type === 'visa_rejection' ? (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Visa Analysis</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Enrollment Analysis</Badge>
    );
  };

  // Render detailed analysis view
  const renderAnalysisDetail = () => {
    if (!selectedAnalysis || !analysisDetail) return null;

    return (
      <div className="space-y-6">
        {/* Back button and header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={backToList} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Analysis List
          </Button>
        </div>

        {/* Important Disclaimer */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-2">Important Legal Disclaimer</p>
                <p className="text-amber-700 leading-relaxed">
                  This analysis is for informational purposes only and should not be considered as professional {selectedAnalysis.type === 'visa_rejection' ? 'immigration' : 'education'} advice. 
                  Always consult with qualified {selectedAnalysis.type === 'visa_rejection' ? 'immigration experts or lawyers' : 'education consultants and immigration advisors'} before making any decisions. 
                  This tool and company will not be liable for any financial or other losses caused by decisions made based on this analysis.
                  Make your decisions based on professional expert guidance and your own thorough research.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${selectedAnalysis.type === 'visa_rejection' ? 'bg-blue-100' : 'bg-green-100'}`}>
              {selectedAnalysis.type === 'visa_rejection' ? (
                <FileText className="h-5 w-5 text-blue-600" />
              ) : (
                <GraduationCap className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {selectedAnalysis.type === 'visa_rejection' ? 'Visa Document Analysis' : 'Enrollment Document Analysis'}
              </p>
              <p className="text-sm text-gray-600">{analysisDetail.filename}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(analysisDetail.createdAt).toLocaleDateString()}
            </span>
            {analysisDetail.country && (
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {analysisDetail.country}
              </span>
            )}
            {analysisDetail.institutionCountry && (
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {analysisDetail.studentCountry} → {analysisDetail.institutionCountry}
              </span>
            )}
            {analysisDetail.visaType && (
              <Badge variant="outline">{analysisDetail.visaType}</Badge>
            )}
            {selectedAnalysis.type === 'visa_rejection' && analysisDetail.isPublic !== undefined && (
              <Badge variant={analysisDetail.isPublic ? "default" : "secondary"}>
                {analysisDetail.isPublic ? "Public" : "Private"}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Complete Original Analysis */}
        {analysisDetail.analysisResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className={`h-5 w-5 ${selectedAnalysis.type === 'visa_rejection' ? 'text-blue-600' : 'text-green-600'}`} />
                Complete {selectedAnalysis.type === 'visa_rejection' ? 'Visa' : 'Enrollment'} Analysis Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm break-words font-mono">
                  {typeof analysisDetail.analysisResults === 'string' 
                    ? analysisDetail.analysisResults 
                    : JSON.stringify(analysisDetail.analysisResults, null, 2).replace(/[{}"]/g, '').replace(/,\s*$/gm, '')
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary - Fallback */}
        {!analysisDetail.analysisResults && analysisDetail.summary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className={`h-5 w-5 ${selectedAnalysis.type === 'visa_rejection' ? 'text-blue-600' : 'text-green-600'}`} />
                {selectedAnalysis.type === 'visa_rejection' ? 'Visa' : 'Enrollment'} Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed break-words">{analysisDetail.summary}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Professional Guidance Recommendation */}
        <Card className={`border-${selectedAnalysis.type === 'visa_rejection' ? 'blue' : 'green'}-200 bg-${selectedAnalysis.type === 'visa_rejection' ? 'blue' : 'green'}-50`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className={`h-5 w-5 text-${selectedAnalysis.type === 'visa_rejection' ? 'blue' : 'green'}-600 mt-0.5 flex-shrink-0`} />
              <div className="text-sm">
                <p className={`font-medium text-${selectedAnalysis.type === 'visa_rejection' ? 'blue' : 'green'}-800 mb-2`}>
                  {selectedAnalysis.type === 'visa_rejection' ? 'Next Steps Recommendation' : 'Professional Guidance Recommended'}
                </p>
                <p className={`text-${selectedAnalysis.type === 'visa_rejection' ? 'blue' : 'green'}-700 leading-relaxed`}>
                  {selectedAnalysis.type === 'visa_rejection' ? (
                    <>
                      Based on this analysis, we strongly recommend consulting with qualified immigration experts who can provide 
                      personalized guidance for your specific situation. Consider booking a consultation with our certified immigration advisors 
                      who can help you understand these findings and create an actionable plan for your visa application process.
                    </>
                  ) : (
                    <>
                      Based on this enrollment document analysis, we recommend consulting with qualified education consultants and immigration advisors 
                      who can verify this information with the issuing institution and provide personalized guidance for your study abroad journey. 
                      Consider booking a consultation with our certified education advisors who can help you understand these findings and create 
                      a comprehensive plan for your academic and visa application process.
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Show detailed view if analysis is selected
  if (selectedAnalysis) {
    return (
      <DashboardLayout>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading analysis...</p>
              </div>
            </div>
          ) : (
            renderAnalysisDetail()
          )}
        </ScrollArea>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">My Analysis</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              All your document analyses in one place - visa rejections and enrollment documents
            </p>
          </div>
        </div>

        {/* Enhanced Filters */}
        <EnhancedFilters
          filters={filters}
          onFiltersChange={setFilters}
          config={{
            showSearch: true,
            showAnalysisType: true,
            showSeverity: true,
            showCountry: true,
            showDateRange: true,
          }}
          resultCount={filteredAnalyses.length}
        />

        <Tabs defaultValue="all-analyses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-analyses">All Analyses ({filteredAnalyses.length})</TabsTrigger>
            <TabsTrigger value="visa-rejection">Visa Analysis ({filteredVisaAnalyses.length})</TabsTrigger>
            <TabsTrigger value="enrollment">Enrollment ({filteredEnrollmentAnalyses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all-analyses" className="space-y-4">
            {paginatedAnalyses.length > 0 ? (
              <div className="grid gap-4">
                {paginatedAnalyses.map((analysis) => (
                  <Card key={`${analysis.type}-${analysis.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
                            {getAnalysisIcon(analysis.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900 truncate">{analysis.filename}</h3>
                              {getAnalysisTypeBadge(analysis.type)}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{getAnalysisTypeLabel(analysis.type)}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(analysis.createdAt).toLocaleDateString()}
                              </span>
                              {analysis.institutionCountry && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {analysis.institutionCountry}
                                </span>
                              )}
                              {analysis.studentCountry && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {analysis.studentCountry}
                                </span>
                              )}
                              {analysis.visaType && (
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {analysis.visaType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => viewAnalysis(analysis.id, analysis.type)}
                          >
                            View Analysis
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gray-100 p-4 rounded-full">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Analyses Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start by analyzing your first document to see comprehensive insights and recommendations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/visa-analysis">
                      <Button>Analyze Visa Document</Button>
                    </Link>
                    <Link href="/enrollment-analysis">
                      <Button variant="outline">Analyze Enrollment Document</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {paginatedAnalyses.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredAnalyses.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </TabsContent>

          <TabsContent value="visa-rejection" className="space-y-4">
            {paginatedVisaAnalyses.length > 0 ? (
              <div className="grid gap-4">
                {paginatedVisaAnalyses.map((analysis) => (
                  <Card key={`visa-${analysis.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900 truncate">{analysis.filename}</h3>
                              <Badge className="bg-red-100 text-red-800 border-red-200">Visa Analysis</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Visa document analysis with detailed insights</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(analysis.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => viewAnalysis(analysis.id, analysis.type)}
                          >
                            View Analysis
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-4 rounded-full">
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Visa Analyses Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Upload a visa document to get comprehensive analysis and recommendations.
                  </p>
                  <Link href="/visa-analysis">
                    <Button>Analyze Visa Document</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            
            {paginatedVisaAnalyses.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredVisaAnalyses.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </TabsContent>

          <TabsContent value="enrollment" className="space-y-4">
            {paginatedEnrollmentAnalyses.length > 0 ? (
              <div className="grid gap-4">
                {paginatedEnrollmentAnalyses.map((analysis) => (
                  <Card key={`enrollment-${analysis.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900 truncate">{analysis.filename}</h3>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">Enrollment Analysis</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Enrollment document verification and analysis</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(analysis.createdAt).toLocaleDateString()}
                              </span>
                              {analysis.institutionCountry && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {analysis.institutionCountry}
                                </span>
                              )}
                              {analysis.studentCountry && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {analysis.studentCountry}
                                </span>
                              )}
                              {analysis.visaType && (
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {analysis.visaType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => viewAnalysis(analysis.id, analysis.type)}
                          >
                            View Analysis
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-4 rounded-full">
                      <GraduationCap className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrollment Analyses Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Upload an enrollment document to verify and analyze it for accuracy.
                  </p>
                  <Link href="/enrollment-analysis">
                    <Button>Analyze Enrollment Document</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            
            {paginatedEnrollmentAnalyses.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredEnrollmentAnalyses.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}