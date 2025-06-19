import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useLocation } from 'wouter';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, FileText, Users, Calendar, TrendingUp, Clock, ExternalLink, Building2 } from 'lucide-react';
import { EnhancedFilters, FilterOptions } from '@/components/EnhancedFilters';
import { PaginationControls } from '@/components/ui/pagination-controls';

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

function AdminAnalyses() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sortBy: 'date-desc',
    analysisType: 'all'
  });
  const [, setLocation] = useLocation();

  const ITEMS_PER_PAGE = 9;

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['/api/admin/analyses'],
    staleTime: 0, // Disable cache to get fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  if (selectedAnalysis) {
    return <AnalysisDetailView analysis={selectedAnalysis} onBack={() => setSelectedAnalysis(null)} />;
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const openAnalysisDetails = (analysis: AnalysisData) => {
    // For COE analyses, route to the COE analysis view
    if (analysis.analysisType === 'enrollment_analysis') {
      setLocation(`/coe-analysis/${analysis.id}`);
    } else {
      // For other analyses, show the detailed view
      setSelectedAnalysis(analysis);
    }
  };

  // Apply filters
  let filtered = Array.isArray(analyses) ? [...analyses] : [];
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((analysis: AnalysisData) => 
      analysis.fileName?.toLowerCase().includes(searchLower) ||
      analysis.user?.firstName?.toLowerCase().includes(searchLower) ||
      analysis.user?.lastName?.toLowerCase().includes(searchLower) ||
      analysis.analysisResults?.summary?.toLowerCase().includes(searchLower)
    );
  }

  if (filters.analysisType && filters.analysisType !== 'all') {
    filtered = filtered.filter((analysis: AnalysisData) => analysis.analysisType === filters.analysisType);
  }

  if (filters.severity) {
    filtered = filtered.filter((analysis: AnalysisData) => 
      analysis.analysisResults?.rejectionReasons?.some((reason: any) => reason.severity === filters.severity) ||
      analysis.analysisResults?.keyFindings?.some((finding: any) => finding.importance === filters.severity)
    );
  }

  if (filters.isPublic !== undefined) {
    filtered = filtered.filter((analysis: AnalysisData) => analysis.isPublic === filters.isPublic);
  }

  if (filters.country) {
    filtered = filtered.filter((analysis: AnalysisData) => 
      analysis.analysisResults?.summary?.toLowerCase().includes(filters.country!.toLowerCase())
    );
  }

  // Apply sorting
  if (filters.sortBy) {
    filtered.sort((a: AnalysisData, b: AnalysisData) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name-asc':
          return a.fileName.localeCompare(b.fileName);
        case 'name-desc':
          return b.fileName.localeCompare(a.fileName);
        case 'type-asc':
          return (a.analysisType || '').localeCompare(b.analysisType || '');
        case 'type-desc':
          return (b.analysisType || '').localeCompare(a.analysisType || '');
        case 'user-asc':
          return (a.user?.firstName || '').localeCompare(b.user?.firstName || '');
        case 'user-desc':
          return (b.user?.firstName || '').localeCompare(a.user?.firstName || '');
        default:
          return 0;
      }
    });
  }

  // Calculate pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAnalyses = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">Analysis Reports</h1>
            <p className="text-gray-600 mt-1">Review and manage all document analysis reports</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Analyses</p>
                  <p className="text-xl font-bold">{Array.isArray(analyses) ? analyses.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unique Users</p>
                  <p className="text-xl font-bold">{new Set(filtered.map((a: AnalysisData) => a.userId)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Visa Analyses</p>
                  <p className="text-xl font-bold">{filtered.filter((a: AnalysisData) => a.analysisType === 'visa_analysis').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">COE Analyses</p>
                  <p className="text-xl font-bold">{filtered.filter((a: AnalysisData) => a.analysisType === 'enrollment_analysis').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <EnhancedFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          config={{
            showAnalysisType: true,
            showSeverity: true,
            showPublicFilter: true,
            showSearch: true,
            showSorting: true
          }}
        />

        {/* Analysis List */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Reports ({totalItems})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading analyses...</div>
            ) : paginatedAnalyses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No analyses found matching your criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedAnalyses.map((analysis: AnalysisData) => (
                  <div
                    key={analysis.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openAnalysisDetails(analysis)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <h3 className="font-medium text-gray-900 truncate">{analysis.fileName}</h3>
                          <Badge variant={analysis.analysisType === 'visa_analysis' ? 'destructive' : 'default'}>
                            {analysis.analysisType === 'visa_analysis' ? 'Visa' : analysis.analysisType === 'enrollment_analysis' ? 'COE' : 'Document'}
                          </Badge>
                          {analysis.isPublic && (
                            <Badge variant="outline">Public</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          User: {analysis.user ? `${analysis.user.firstName} ${analysis.user.lastName}` : 'Unknown'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(analysis.createdAt), 'MMM dd, yyyy')}
                          </span>
                          {analysis.analysisResults?.institutionName && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Users className="h-3 w-3" />
                              {analysis.analysisResults.institutionName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          {analysis.analysisType === 'enrollment_analysis' ? (
                            <>
                              <ExternalLink className="h-3 w-3" />
                              View COE Details
                            </>
                          ) : (
                            'View Analysis'
                          )}
                        </Button>
                        {analysis.analysisType === 'enrollment_analysis' && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            <Building2 className="h-3 w-3 mr-1" />
                            COE
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
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

        {/* Analysis Display */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="findings" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Key Findings
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="next-steps" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next Steps
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Complete Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Document Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Document Type</p>
                      <p className="font-semibold text-gray-900">
                        {analysis.analysisType === 'enrollment_analysis' ? 'COE Analysis' : 'Visa Analysis'}
                      </p>
                      {analysis.analysisResults?.institutionName && (
                        <p className="text-xs text-blue-600 mt-1">
                          {analysis.analysisResults.institutionName}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Analysis Date</p>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(analysis.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">User</p>
                      <p className="font-semibold text-gray-900">
                        {analysis.user ? `${analysis.user.firstName} ${analysis.user.lastName}` : 'Unknown User'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Summary */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="text-xl text-gray-800">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div 
                  className="whitespace-pre-wrap text-gray-700 leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ 
                    __html: formatNumericalInfo(analysis.analysisResults?.summary || 'No summary available for this analysis.') 
                  }}
                />
                
                {/* Analysis Quality Indicators */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3">Analysis Quality Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Findings</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {analysis.analysisResults?.keyFindings?.length || 
                           analysis.analysisResults?.rejectionReasons?.length || 0}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Recommendations</span>
                        <Badge className="bg-green-100 text-green-800">
                          {analysis.analysisResults?.recommendations?.length || 0}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-700">Action Steps</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          {Array.isArray(analysis.analysisResults?.nextSteps) ? 
                           analysis.analysisResults.nextSteps.length : 
                           analysis.analysisResults?.nextSteps ? 1 : 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Confidence */}
                {analysis.analysisResults?.confidence && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">Analysis Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${analysis.analysisResults.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-blue-600">
                          {Math.round(analysis.analysisResults.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="findings">
            {/* Key Findings */}
            {analysis.analysisResults?.keyFindings && analysis.analysisResults.keyFindings.length > 0 ? (
              <div className="space-y-4">
                {analysis.analysisResults.keyFindings.map((finding, index) => (
                  <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-2 h-full rounded-full ${
                          finding.importance === 'high' ? 'bg-red-400' :
                          finding.importance === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{finding.title}</h3>
                            <Badge className={
                              finding.importance === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                              finding.importance === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-blue-100 text-blue-800 border-blue-200'
                            }>
                              {finding.importance} priority
                            </Badge>
                          </div>
                          <p className="text-gray-700 leading-relaxed mb-3" 
                             dangerouslySetInnerHTML={{ __html: formatNumericalInfo(finding.description) }} />
                          
                          {/* Enhanced Action Items */}
                          {(finding as any).actionRequired && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-3">
                              <h4 className="font-medium text-amber-800 mb-2">Action Required</h4>
                              <p className="text-amber-700">{(finding as any).actionRequired}</p>
                              {(finding as any).deadline && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Calendar className="h-4 w-4 text-amber-600" />
                                  <span className="text-sm text-amber-600 font-medium">
                                    Deadline: {(finding as any).deadline}
                                  </span>
                                </div>
                              )}
                              {(finding as any).amount && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                                    Amount: {(finding as any).amount}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Consequences Warning */}
                          {(finding as any).consequence && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-red-800 mb-1">Potential Consequence</h4>
                                  <p className="text-red-700 text-sm">{(finding as any).consequence}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : analysis.analysisResults?.rejectionReasons && analysis.analysisResults.rejectionReasons.length > 0 ? (
              <div className="space-y-4">
                {analysis.analysisResults.rejectionReasons.map((reason, index) => (
                  <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-full bg-red-400 rounded-full" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{reason.title}</h3>
                          <p className="text-gray-700 leading-relaxed mb-3">{reason.description}</p>
                          {reason.severity && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              {reason.severity}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No specific findings identified in this analysis.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            {/* Recommendations */}
            {analysis.analysisResults?.recommendations && analysis.analysisResults.recommendations.length > 0 ? (
              <div className="space-y-4">
                {analysis.analysisResults.recommendations.map((rec, index) => (
                  <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-2 h-full rounded-full ${
                          rec.priority === 'urgent' ? 'bg-red-400' :
                          rec.priority === 'important' ? 'bg-orange-400' : 'bg-green-400'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                            {rec.priority && (
                              <Badge className={
                                rec.priority === 'urgent' ? 'bg-red-100 text-red-800 border-red-200' :
                                rec.priority === 'important' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                'bg-green-100 text-green-800 border-green-200'
                              }>
                                {rec.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700 leading-relaxed mb-3" 
                             dangerouslySetInnerHTML={{ __html: formatNumericalInfo(rec.description) }} />
                          
                          {/* Actionable Steps */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                            <h4 className="font-medium text-green-800 mb-2">Recommended Action</h4>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-green-700">{rec.description}</p>
                              </div>
                              
                              {/* Timeline Indicator */}
                              <div className="flex items-center gap-2 mt-3">
                                <Calendar className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">
                                  {rec.priority === 'urgent' ? 'Complete within 1-2 weeks' :
                                   rec.priority === 'important' ? 'Complete within 1 month' :
                                   'Complete within 2-3 months'}
                                </span>
                              </div>
                              
                              {/* Impact Level */}
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">
                                  {rec.priority === 'urgent' ? 'High impact on application success' :
                                   rec.priority === 'important' ? 'Moderate impact on approval chances' :
                                   'Recommended for optimal outcome'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No recommendations provided for this analysis.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="next-steps">
            {/* Next Steps */}
            {analysis.analysisResults?.nextSteps ? (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="text-xl text-gray-800">Next Steps & Action Plan</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {Array.isArray(analysis.analysisResults.nextSteps) ? (
                    <div className="space-y-6">
                      {analysis.analysisResults.nextSteps.map((step, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold border-2 border-purple-200">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              {typeof step === 'string' ? (
                                <div>
                                  <p className="text-gray-700 leading-relaxed font-medium" 
                                     dangerouslySetInnerHTML={{ __html: formatNumericalInfo(step) }} />
                                  
                                  {/* Auto-generated action framework */}
                                  <div className="mt-4 bg-white border border-gray-200 rounded-lg p-3">
                                    <h5 className="font-medium text-gray-800 mb-2">Action Framework</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                      <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                                        <span className="font-medium text-blue-800">Timeline:</span>
                                        <p className="text-blue-700">
                                          {index === 0 ? 'Immediate (1-2 weeks)' :
                                           index === 1 ? 'Short-term (2-4 weeks)' :
                                           'Long-term (1-3 months)'}
                                        </p>
                                      </div>
                                      <div className="bg-green-50 p-2 rounded border-l-2 border-green-400">
                                        <span className="font-medium text-green-800">Priority:</span>
                                        <p className="text-green-700">
                                          {index === 0 ? 'Critical' :
                                           index === 1 ? 'High' :
                                           'Standard'}
                                        </p>
                                      </div>
                                      <div className="bg-purple-50 p-2 rounded border-l-2 border-purple-400">
                                        <span className="font-medium text-purple-800">Category:</span>
                                        <p className="text-purple-700">Action Required</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-2">{step.step || step.title}</h4>
                                  <p className="text-gray-700 leading-relaxed mb-3" 
                                     dangerouslySetInnerHTML={{ __html: formatNumericalInfo(step.description) }} />
                                  
                                  {/* Enhanced step details */}
                                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-800">Category:</span>
                                        <Badge className="ml-2 bg-purple-100 text-purple-800">
                                          {step.category || 'General'}
                                        </Badge>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-800">Timeline:</span>
                                        <span className="ml-2 text-purple-700">
                                          {step.category === 'immediate' ? '1-2 weeks' :
                                           step.category === 'short_term' ? '2-8 weeks' :
                                           step.category === 'long_term' ? '2-6 months' :
                                           'As needed'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4" 
                         dangerouslySetInnerHTML={{ __html: formatNumericalInfo(analysis.analysisResults.nextSteps) }} />
                      
                      {/* Summary action box */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-medium text-purple-800 mb-2">Summary Action Required</h4>
                        <p className="text-purple-700 text-sm">
                          Review the detailed steps above and prioritize actions based on your specific timeline and requirements. 
                          Consider consulting with relevant experts for complex matters.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No next steps provided for this analysis.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Complete Details Tab - Copy from User Dashboard */}
          <TabsContent value="details" className="space-y-6">
            {analysis.analysisType === 'enrollment_analysis' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Academic Information */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Institution:</p>
                        <p className="text-base text-gray-900">{analysis.analysisResults?.institutionName || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Program:</p>
                        <p className="text-base text-gray-900">{analysis.analysisResults?.programName || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Student Name:</p>
                        <p className="text-base text-gray-900">{analysis.analysisResults?.studentName || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Document Type:</p>
                        <p className="text-base text-gray-900">{analysis.analysisResults?.documentType || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Analysis Date:</p>
                        <p className="text-base text-gray-900">{format(new Date(analysis.createdAt), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Summary */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Quick Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div 
                      className="text-gray-700 whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{ 
                        __html: formatNumericalInfo(analysis.analysisResults?.summary || 'Analysis summary not available.') 
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Visa Analysis Complete Details */
              <Card>
                <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Complete Visa Analysis Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Analysis Type:</p>
                      <p className="text-base text-gray-900">Visa Analysis</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Document Information:</p>
                      <p className="text-base text-gray-900">{analysis.fileName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Complete Analysis:</p>
                      <div 
                        className="text-base text-gray-900 whitespace-pre-wrap break-words p-4 bg-gray-50 rounded-lg"
                        dangerouslySetInnerHTML={{ 
                          __html: formatNumericalInfo(analysis.analysisResults?.summary || 'Complete analysis details not available.') 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
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

export default AdminAnalyses;