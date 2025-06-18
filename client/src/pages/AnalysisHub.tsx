import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EnhancedFilters, FilterOptions, searchInText, filterByDateRange } from '@/components/EnhancedFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, GraduationCap, Calendar, User, Building2, Globe, AlertTriangle, TrendingUp } from 'lucide-react';
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

export default function AnalysisHub() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

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

  // Combine and sort all analyses
  const allAnalyses = [...visaAnalyses, ...enrollmentAnalyses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Memoized filtered analyses for performance
  const filteredAnalyses = useMemo(() => {
    let filtered = allAnalyses;

    // Text search across multiple fields
    if (filters.searchTerm) {
      filtered = filtered.filter(analysis => 
        searchInText(analysis, filters.searchTerm!, [
          'filename',
          'rejectionReasons.title',
          'rejectionReasons.description',
          'institutionName',
          'documentType',
          'summary'
        ])
      );
    }

    // Filter by analysis type
    if (filters.analysisType) {
      filtered = filtered.filter(analysis => analysis.type === filters.analysisType);
    }

    // Filter by severity (for visa rejection analyses)
    if (filters.severity) {
      filtered = filtered.filter(analysis => {
        if (analysis.type === 'visa_rejection' && analysis.rejectionReasons) {
          return analysis.rejectionReasons.some(reason => reason.severity === filters.severity);
        }
        return true;
      });
    }

    // Filter by date range
    if (filters.dateRange) {
      filtered = filterByDateRange(filtered, 'createdAt', filters.dateRange);
    }

    // Filter by country (searches in filename and other available fields)
    if (filters.country) {
      filtered = filtered.filter(analysis => {
        const searchText = [
          analysis.filename,
          analysis.institutionCountry,
          analysis.visaType
        ].filter(Boolean).join(' ').toLowerCase();
        return searchText.includes(filters.country!.toLowerCase());
      });
    }

    return filtered;
  }, [allAnalyses, filters]);

  // Separate filtered analyses by type for tabs
  const filteredVisaAnalyses = filteredAnalyses.filter(a => a.type === 'visa_rejection');
  const filteredEnrollmentAnalyses = filteredAnalyses.filter(a => a.type === 'enrollment');

  const getAnalysisIcon = (type: string) => {
    return type === 'visa_rejection' ? (
      <AlertTriangle className="h-5 w-5 text-red-600" />
    ) : (
      <GraduationCap className="h-5 w-5 text-blue-600" />
    );
  };

  const getAnalysisTypeLabel = (type: string) => {
    return type === 'visa_rejection' ? 'Visa Rejection Analysis' : 'Enrollment Analysis';
  };

  const getAnalysisTypeBadge = (type: string) => {
    return type === 'visa_rejection' ? (
      <Badge className="bg-red-100 text-red-800 border-red-200">Rejection Analysis</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Enrollment Analysis</Badge>
    );
  };

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
            <TabsTrigger value="visa-rejection">Visa Rejection ({filteredVisaAnalyses.length})</TabsTrigger>
            <TabsTrigger value="enrollment">Enrollment ({filteredEnrollmentAnalyses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all-analyses" className="space-y-4">
            {filteredAnalyses.length > 0 ? (
              <div className="grid gap-4">
                {filteredAnalyses.map((analysis) => (
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
                          {analysis.type === 'visa_rejection' ? (
                            <Link href={`/analyzer?analysis=${analysis.id}`}>
                              <Button variant="outline" size="sm" className="w-full">
                                View Analysis
                              </Button>
                            </Link>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedAnalysis(analysis)}
                              className="w-full"
                            >
                              View Analysis
                            </Button>
                          )}
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
                      <Button className="w-full sm:w-auto">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Analyze Visa Rejection
                      </Button>
                    </Link>
                    <Link href="/enrollment-analysis">
                      <Button variant="outline" className="w-full sm:w-auto">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Analyze Enrollment Document
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="visa-rejection" className="space-y-4">
            {filteredVisaAnalyses.length > 0 ? (
              <div className="grid gap-4">
                {filteredVisaAnalyses.map((analysis) => (
                  <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 mb-2 truncate">{analysis.filename}</h3>
                            <p className="text-sm text-gray-600 mb-3">Visa rejection letter analysis with detailed insights</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(analysis.createdAt).toLocaleDateString()}
                              </span>
                              {analysis.rejectionReasons && (
                                <span>{analysis.rejectionReasons.length} reasons identified</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Link href={`/analyzer?analysis=${analysis.id}`}>
                          <Button variant="outline" size="sm">
                            View Analysis
                          </Button>
                        </Link>
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
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Visa Rejection Analyses</h3>
                  <p className="text-gray-600 mb-6">
                    Upload a visa rejection letter to get detailed analysis and recommendations for improvement.
                  </p>
                  <Link href="/visa-analysis">
                    <Button>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Analyze Visa Rejection
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="enrollment" className="space-y-4">
            {filteredEnrollmentAnalyses.length > 0 ? (
              <div className="grid gap-4">
                {filteredEnrollmentAnalyses.map((analysis) => (
                  <Card key={analysis.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 mb-2 truncate">{analysis.filename}</h3>
                            <p className="text-sm text-gray-600 mb-3">Enrollment document analysis with country and visa insights</p>
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
                              {analysis.visaType && (
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {analysis.visaType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedAnalysis(analysis)}
                        >
                          View Analysis
                        </Button>
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
                      <GraduationCap className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrollment Analyses</h3>
                  <p className="text-gray-600 mb-6">
                    Upload enrollment documents like I-20, CAS letters, or admission letters for comprehensive analysis.
                  </p>
                  <Link href="/enrollment-analysis">
                    <Button>
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Analyze Enrollment Document
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}