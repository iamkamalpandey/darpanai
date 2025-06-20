import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Calendar, Filter, Clock } from 'lucide-react';
import { useLocation } from 'wouter';

interface AnalysisItem {
  id: number;
  filename: string;
  fileName?: string;
  type: 'visa' | 'coe' | 'offer_letter';
  createdAt: string;
  analysisDate?: string;
  universityName?: string;
  program?: string;
  visaType?: string;
}

export default function MyAnalysis() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [, setLocation] = useLocation();

  // Fetch all analysis types
  const { data: visaAnalyses = [] } = useQuery({
    queryKey: ['/api/analyses'],
    select: (data: any[]) => data.map(item => ({
      id: item.id,
      filename: item.filename,
      type: 'visa' as const,
      createdAt: item.createdAt,
      visaType: 'Visa Application'
    }))
  });

  const { data: coeAnalyses = [] } = useQuery({
    queryKey: ['/api/coe-analyses'],
    select: (data: any[]) => data.map(item => ({
      id: item.id,
      filename: item.filename,
      type: 'coe' as const,
      createdAt: item.createdAt,
      visaType: 'COE Document'
    }))
  });

  const { data: offerLetterAnalyses = [] } = useQuery({
    queryKey: ['/api/offer-letter-analyses'],
    select: (data: any[]) => data.map(item => ({
      id: item.id,
      filename: item.fileName || 'Untitled Document',
      type: 'offer_letter' as const,
      createdAt: item.analysisDate || item.createdAt,
      universityName: item.universityInfo?.name,
      program: item.universityInfo?.program,
      visaType: 'Offer Letter'
    }))
  });

  // Combine and filter analyses
  const allAnalyses: AnalysisItem[] = useMemo(() => {
    return [...visaAnalyses, ...coeAnalyses, ...offerLetterAnalyses];
  }, [visaAnalyses, coeAnalyses, offerLetterAnalyses]);

  const filteredAnalyses = useMemo(() => {
    let filtered = allAnalyses;

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(analysis =>
        analysis.filename.toLowerCase().includes(search) ||
        (analysis.universityName && analysis.universityName.toLowerCase().includes(search)) ||
        (analysis.program && analysis.program.toLowerCase().includes(search)) ||
        (analysis.visaType && analysis.visaType.toLowerCase().includes(search))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(analysis => analysis.type === typeFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(analysis => {
        const analysisDate = new Date(analysis.createdAt);
        const analysisDay = new Date(analysisDate.getFullYear(), analysisDate.getMonth(), analysisDate.getDate());
        
        switch (dateFilter) {
          case 'today':
            return analysisDay.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return analysisDay >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            return analysisDay >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      switch (sortBy) {
        case 'date-asc':
          return dateA - dateB;
        case 'date-desc':
          return dateB - dateA;
        case 'name-asc':
          return a.filename.localeCompare(b.filename);
        case 'name-desc':
          return b.filename.localeCompare(a.filename);
        default:
          return dateB - dateA;
      }
    });

    return filtered;
  }, [allAnalyses, searchTerm, typeFilter, dateFilter, sortBy]);

  const viewAnalysis = (analysis: AnalysisItem) => {
    switch (analysis.type) {
      case 'visa':
        setLocation(`/visa-analysis/${analysis.id}`);
        break;
      case 'coe':
        setLocation(`/coe-analysis/${analysis.id}`);
        break;
      case 'offer_letter':
        setLocation(`/offer-letter-analysis/${analysis.id}`);
        break;
    }
  };

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'visa':
        return 'Visa Analysis';
      case 'coe':
        return 'COE Analysis';
      case 'offer_letter':
        return 'Offer Letter Analysis';
      default:
        return 'Unknown';
    }
  };

  const getAnalysisTypeColor = (type: string) => {
    switch (type) {
      case 'visa':
        return 'bg-red-100 text-red-800';
      case 'coe':
        return 'bg-blue-100 text-blue-800';
      case 'offer_letter':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Analysis</h1>
            <p className="text-gray-600 mt-1">
              View and manage all your document analysis reports in one place
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {filteredAnalyses.length} {filteredAnalyses.length === 1 ? 'Analysis' : 'Analyses'}
          </Badge>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search analyses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="visa">Visa Analysis</SelectItem>
                  <SelectItem value="coe">COE Analysis</SelectItem>
                  <SelectItem value="offer_letter">Offer Letter Analysis</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Analysis List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              Previous Analyses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Analyses Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || typeFilter !== 'all' || dateFilter !== 'all' 
                    ? 'Try adjusting your search filters to find analyses.'
                    : 'Upload your first document to get started with AI-powered analysis.'
                  }
                </p>
                {searchTerm || typeFilter !== 'all' || dateFilter !== 'all' ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                      setDateFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAnalyses.map((analysis) => (
                  <div 
                    key={`${analysis.type}-${analysis.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => viewAnalysis(analysis)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {analysis.filename}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getAnalysisTypeColor(analysis.type)}`}
                          >
                            {getAnalysisTypeLabel(analysis.type)}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 text-sm font-medium">View Analysis</span>
                      <div className="p-1">
                        <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}