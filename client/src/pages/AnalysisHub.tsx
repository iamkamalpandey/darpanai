import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Pagination } from '@/components/Pagination';
import { EnhancedFilters, FilterOptions, filterByDateRange } from '@/components/EnhancedFilters';
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

  // Enhanced number formatting for comprehensive display of numerical figures
  const formatNumericalInfo = (text: string) => {
    // Comprehensive regex to capture all numerical patterns including:
    // - Currency amounts ($50,000, USD 25,000, CAD 15,000, €20,000, £18,000)
    // - Duration and time periods (2 years, 3-4 semesters, 18 months)
    // - Academic years and dates (2023-2024, Fall 2024, January 15, 2025)
    // - Percentages and scores (85%, 3.5 GPA, 90% scholarship coverage)
    // - Quantities and measurements (40 hours, 120 credits, 3.8 CGPA)
    // - Tuition and fee amounts (tuition fees, application fee, living costs)
    return text.replace(
      /(\$[\d,]+(?:\.\d{2})?(?:\s*(?:CAD|USD|AUD|per\s+(?:year|semester|month|week)?))?|(?:CAD|USD|AUD|EUR|GBP|₹|¥)\s*[\d,]+(?:\.\d{2})?|€[\d,]+(?:\.\d{2})?|£[\d,]+(?:\.\d{2})?|₹[\d,]+(?:\.\d{2})?|\d+(?:\.\d+)?\s*(?:years?|semesters?|months?|weeks?|days?|hours?|credits?|units?)|(?:19|20)\d{2}(?:-(?:19|20)?\d{2})?|\d+(?:\.\d+)?%(?:\s*(?:scholarship|coverage|reduction|discount|off))?|\d+(?:\.\d+)?\s*(?:GPA|CGPA|IELTS|TOEFL|SAT|ACT|score)|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*(?:19|20)?\d{2}|\d{1,2}(?:st|nd|rd|th)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(?:19|20)?\d{2})?|(?:Fall|Spring|Summer|Winter)\s+(?:19|20)?\d{2}|\d+(?:\.\d+)?\s*(?:per\s+(?:year|semester|month|week|credit|hour))|tuition\s+(?:fees?|costs?)\s*(?:of\s+)?\$?[\d,]+(?:\.\d{2})?|application\s+fee\s*(?:of\s+)?\$?[\d,]+(?:\.\d{2})?|scholarship\s+(?:of\s+|worth\s+)?\$?[\d,]+(?:\.\d{2})?)/gi,
      '<span class="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">$1</span>'
    );
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Fetch visa rejection analyses with optimized caching
  const { data: visaAnalyses = [], isLoading: visaLoading } = useQuery<Analysis[]>({
    queryKey: ['/api/analyses'],
    select: (data) => data.map(item => ({ ...item, type: 'visa_rejection' as const })),
    staleTime: 20 * 60 * 1000, // 20 minutes
  });

  // Fetch enrollment analyses with optimized caching
  const { data: enrollmentAnalyses = [], isLoading: enrollmentLoading } = useQuery<Analysis[]>({
    queryKey: ['/api/enrollment-analyses'],
    select: (data) => data.map(item => ({ ...item, type: 'enrollment' as const })),
    staleTime: 20 * 60 * 1000, // 20 minutes
  });

  // Navigate to specific analysis detail pages
  const viewAnalysis = (id: number, type: 'visa_rejection' | 'enrollment') => {
    if (type === 'enrollment') {
      setLocation(`/coe-analysis/${id}`);
    } else {
      setLocation(`/visa-analysis/${id}`);
    }
  };

  // Combine all analyses with optimized sorting
  const allAnalyses = useMemo(() => {
    return [...visaAnalyses, ...enrollmentAnalyses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [visaAnalyses, enrollmentAnalyses]);

  // Memoized filtered and sorted analyses for performance
  const filteredAnalyses = useMemo(() => {
    let filtered = allAnalyses;

    // Text search across multiple fields
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(analysis => 
        analysis.filename.toLowerCase().includes(searchTerm) ||
        (analysis.summary && analysis.summary.toLowerCase().includes(searchTerm)) ||
        (analysis.institutionCountry && analysis.institutionCountry.toLowerCase().includes(searchTerm)) ||
        (analysis.studentCountry && analysis.studentCountry.toLowerCase().includes(searchTerm)) ||
        (analysis.visaType && analysis.visaType.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by analysis type
    if (filters.analysisType && filters.analysisType !== 'all') {
      if (filters.analysisType === 'visa_analysis') {
        filtered = filtered.filter(analysis => analysis.type === 'visa_rejection');
      } else if (filters.analysisType === 'enrollment_analysis') {
        filtered = filtered.filter(analysis => analysis.type === 'enrollment');
      }
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

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let valueA: any, valueB: any;
        
        switch (filters.sortBy) {
          case 'name-asc':
          case 'name-desc':
            valueA = a.filename.toLowerCase();
            valueB = b.filename.toLowerCase();
            break;
          case 'type-asc':
          case 'type-desc':
            valueA = a.type;
            valueB = b.type;
            break;
          case 'date-asc':
          case 'date-desc':
          default:
            valueA = new Date(a.createdAt).getTime();
            valueB = new Date(b.createdAt).getTime();
            break;
        }
        
        // Determine sort direction from sortBy value
        const isDescending = filters.sortBy?.includes('desc');
        
        if (isDescending) {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        } else {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        }
      });
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

  const getAnalysisIcon = useMemo(() => (type: string) => {
    return type === 'visa_rejection' ? (
      <AlertTriangle className="h-5 w-5 text-red-600" />
    ) : (
      <GraduationCap className="h-5 w-5 text-blue-600" />
    );
  }, []);

  const getAnalysisTypeLabel = useMemo(() => (type: string) => {
    return type === 'visa_rejection' ? 'Visa Analysis' : 'Enrollment Analysis';
  }, []);

  const getAnalysisTypeBadge = useMemo(() => (type: string) => {
    return type === 'visa_rejection' ? (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Visa Analysis</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Enrollment Analysis</Badge>
    );
  }, []);

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
            showSorting: true,
          }}
          dropdownOptions={{
            countries: [],
          }}
          resultCount={filteredAnalyses.length}
          placeholder="Search by filename, summary, or country..."
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