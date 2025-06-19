import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  User, 
  FileText, 
  Search,
  ExternalLink
} from 'lucide-react';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface FeedbackItem {
  id: number;
  analysisId: number;
  userId: number;
  analysisType: 'visa' | 'enrollment';
  overallRating: number;
  feedback?: string;
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
  analysis: {
    filename: string;
    documentType?: string;
  };
}

export default function AdminFeedback() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'visa' | 'enrollment'>('all');
  const itemsPerPage = 12;

  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ['/api/admin/feedback'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const feedbacks: FeedbackItem[] = feedbackData || [];

  // Filter and search feedback
  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesSearch = 
      item.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.analysis.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.feedback && item.feedback.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || item.analysisType === filterType;
    
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, startIndex + itemsPerPage);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating}/5
        </span>
      </div>
    );
  };

  const getAnalysisRoute = (item: FeedbackItem) => {
    if (item.analysisType === 'visa') {
      return `/admin/visa-analysis/${item.analysisId}`;
    } else {
      return `/admin/coe-analysis/${item.analysisId}`;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Feedback</h1>
          <p className="text-gray-600">
            Monitor and analyze user feedback across all analysis reports
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {feedbacks.length > 0 
                      ? (feedbacks.reduce((sum, f) => sum + f.overallRating, 0) / feedbacks.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">With Comments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {feedbacks.filter(f => f.feedback && f.feedback.trim()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unique Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(feedbacks.map(f => f.userId)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by user, filename, or feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              size="sm"
            >
              All ({feedbacks.length})
            </Button>
            <Button
              variant={filterType === 'visa' ? 'default' : 'outline'}
              onClick={() => setFilterType('visa')}
              size="sm"
            >
              Visa ({feedbacks.filter(f => f.analysisType === 'visa').length})
            </Button>
            <Button
              variant={filterType === 'enrollment' ? 'default' : 'outline'}
              onClick={() => setFilterType('enrollment')}
              size="sm"
            >
              Enrollment ({feedbacks.filter(f => f.analysisType === 'enrollment').length})
            </Button>
          </div>
        </div>

        {/* Feedback Grid */}
        {paginatedFeedbacks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No feedback matches your search criteria.' : 'No user feedback has been submitted yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedFeedbacks.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">{item.user.username}</span>
                    </div>
                    <Badge variant={item.analysisType === 'visa' ? 'default' : 'secondary'}>
                      {item.analysisType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Rating</p>
                    {renderStars(item.overallRating)}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Document</p>
                    <p className="text-sm text-gray-600 truncate" title={item.analysis.filename}>
                      {item.analysis.filename}
                    </p>
                  </div>

                  {item.feedback && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Feedback</p>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {item.feedback}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <a href={getAnalysisRoute(item)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Analysis
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredFeedbacks.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}