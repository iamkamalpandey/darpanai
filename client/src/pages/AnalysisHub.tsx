import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Pagination } from '@/components/Pagination';
import { EnhancedFilters, FilterOptions, searchInText, filterByDateRange } from '@/components/EnhancedFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, GraduationCap, Calendar, User, Building2, Globe, AlertTriangle } from 'lucide-react';
import { Link, useLocation } from 'wouter';

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

export default function AnalysisHub() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [, setLocation] = useLocation();
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

  // Navigate to existing analysis pages that work properly
  const viewAnalysis = (id: number, type: 'visa_rejection' | 'enrollment') => {
    if (type === 'enrollment') {
      setLocation(`/enrollment-analysis-results/${id}`);
    } else {
      setLocation(`/visa-analysis-results/${id}`);
    }
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
        searchInText(analysis.filename, filters.searchTerm, false) ||
        searchInText(analysis.summary, filters.searchTerm, false) ||
        searchInText(analysis.institutionCountry, filters.searchTerm, false) ||
        searchInText(analysis.studentCountry, filters.searchTerm, false) ||
        searchInText(analysis.visaType, filters.searchTerm, false)
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

  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const totalVisaPages = Math.ceil(filteredVisaAnalyses.length / itemsPerPage);
  const totalEnrollmentPages = Math.ceil(filteredEnrollmentAnalyses.length / itemsPerPage);

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
                totalPages={totalPages}
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
                totalPages={totalVisaPages}
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
                totalPages={totalEnrollmentPages}
                onPageChange={setCurrentPage}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}