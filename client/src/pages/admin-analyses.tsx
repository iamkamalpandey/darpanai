import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, FileText, Users, Calendar, TrendingUp } from 'lucide-react';
import { EnhancedFilters, FilterOptions } from '@/components/EnhancedFilters';
import { Pagination } from '@/components/ui/pagination';

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



export default function AdminAnalyses() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sortBy: 'date-desc',
    analysisType: 'all'
  });

  const ITEMS_PER_PAGE = 9;

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['/api/admin/analyses'],
    staleTime: 15 * 60 * 1000,
    refetchOnMount: false,
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
    setSelectedAnalysis(analysis);
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

  if (filters.analysisType) {
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
                  <p className="text-sm text-gray-600">Enrollment Analyses</p>
                  <p className="text-xl font-bold">{filtered.filter((a: AnalysisData) => a.analysisType === 'enrollment_analysis').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <EnhancedFilters
          onFiltersChange={handleFiltersChange}
          analyses={analyses}
          showAnalysisTypeFilter={true}
          showSeverityFilter={true}
          showPublicFilter={true}
          initialFilters={filters}
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
                          <h3 className="font-medium text-gray-900">{analysis.fileName}</h3>
                          <Badge variant={analysis.analysisType === 'visa_analysis' ? 'destructive' : 'default'}>
                            {analysis.analysisType === 'visa_analysis' ? 'Visa Analysis' : 'Enrollment Analysis'}
                          </Badge>
                          {analysis.isPublic && (
                            <Badge variant="outline">Public</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          User: {analysis.user ? `${analysis.user.firstName} ${analysis.user.lastName}` : 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(analysis.createdAt), 'PPp')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="findings">Key Findings</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
          </TabsList>

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
                    __html: formatNumericalInfo(analysis.analysisResults?.summary || 'No summary available for this analysis.') 
                  }}
                />
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
                          <h3 className="font-semibold text-gray-900 mb-2">{finding.title}</h3>
                          <p className="text-gray-700 leading-relaxed mb-3">{finding.description}</p>
                          <Badge className={
                            finding.importance === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                            finding.importance === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }>
                            {finding.importance}
                          </Badge>
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
                        <div className="w-2 h-full bg-green-400 rounded-full" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{rec.title}</h3>
                          <p className="text-gray-700 leading-relaxed mb-3">{rec.description}</p>
                          {rec.priority && (
                            <Badge className={
                              rec.priority === 'urgent' ? 'bg-red-100 text-red-800 border-red-200' :
                              rec.priority === 'important' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              'bg-blue-100 text-blue-800 border-blue-200'
                            }>
                              {rec.priority}
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
                  <CardTitle className="text-xl text-gray-800">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {Array.isArray(analysis.analysisResults.nextSteps) ? (
                    <div className="space-y-4">
                      {analysis.analysisResults.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
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