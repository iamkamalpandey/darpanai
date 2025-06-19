import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface AdminFeedbackViewerProps {
  analysisId: number;
}

interface FeedbackData {
  id: number;
  rating: number;
  feedback?: string;
  createdAt: string;
  userId: number;
  user?: {
    username: string;
    email: string;
  };
}

export function AdminFeedbackViewer({ analysisId }: AdminFeedbackViewerProps) {
  const { data: feedback, isLoading } = useQuery({
    queryKey: [`/api/admin/analyses/${analysisId}/feedback`],
    enabled: !!analysisId,
  });

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!feedback) {
    return (
      <Card className="mt-6 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <MessageSquare className="h-5 w-5" />
            User Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No user feedback submitted for this analysis yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
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

  return (
    <Card className="mt-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <MessageSquare className="h-5 w-5" />
          User Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {feedback.user?.username || `User #${feedback.userId}`}
            </span>
            <Badge variant="outline" className="text-xs">
              {feedback.user?.email}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {format(new Date(feedback.createdAt), 'MMM dd, yyyy')}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Rating
          </label>
          {renderStars(feedback.rating)}
        </div>

        {feedback.feedback && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Comments
            </label>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">
                {feedback.feedback}
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            This feedback helps improve analysis quality and user experience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}