import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, CheckCircle, Calendar, User, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface FeedbackSystemProps {
  analysisId: number;
  analysisType: 'visa' | 'enrollment';
  isAdmin?: boolean;
}

export function FeedbackSystem({ analysisId, analysisType, isAdmin = false }: FeedbackSystemProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch existing feedback
  const apiEndpoint = isAdmin 
    ? `/api/admin/analyses/${analysisId}/feedback`
    : `/api/analyses/${analysisId}/feedback`;

  const { data: existingFeedback, isLoading } = useQuery({
    queryKey: [apiEndpoint],
    enabled: !!analysisId,
  });

  // Set form data from existing feedback
  useEffect(() => {
    if (existingFeedback) {
      setRating((existingFeedback as any).overallRating || 0);
      setFeedback((existingFeedback as any).feedback || '');
    }
  }, [existingFeedback]);

  // Submit feedback (user only)
  const submitFeedback = useMutation({
    mutationFn: async (data: { rating: number; feedback: string }) => {
      const response = await fetch(`/api/analyses/${analysisId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallRating: data.rating,
          feedback: data.feedback,
          analysisType: analysisType,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitFeedback.mutateAsync({
        rating,
        feedback,
      });
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! Your review has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`p-1 transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (interactive ? (hoveredStar || rating) : currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {currentRating > 0 && `${currentRating}/5 stars`}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Admin view
  if (isAdmin) {
    if (!existingFeedback) {
      return (
        <Card className="mt-8 border-gray-200">
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

    return (
      <Card className="mt-8 border-blue-200 bg-blue-50">
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
                {(existingFeedback as any).user?.username || `User #${(existingFeedback as any).userId}`}
              </span>
              <Badge variant="outline" className="text-xs">
                {(existingFeedback as any).user?.email}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              {format(new Date((existingFeedback as any).createdAt), 'MMM dd, yyyy')}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Rating
            </label>
            {renderStars((existingFeedback as any).rating || (existingFeedback as any).overallRating)}
          </div>

          {(existingFeedback as any).feedback && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Comments
              </label>
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {(existingFeedback as any).feedback}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // User view - read-only if already submitted
  if ((existingFeedback as any)?.id) {
    return (
      <Card className="mt-8 border-green-200 bg-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Feedback Submitted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Your Rating
            </label>
            {renderStars(rating)}
          </div>
          
          {feedback && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Your Feedback
              </label>
              <div className="bg-white p-3 rounded-md border text-gray-700">
                {feedback}
              </div>
            </div>
          )}
          
          <p className="text-sm text-green-700">
            Thank you for your feedback! Your review helps us improve our analysis quality.
          </p>

          {/* Call to Action */}
          <div className="mt-6 pt-4 border-t border-green-200">
            <div className="text-center">
              <h4 className="font-medium text-gray-900 mb-2">Need Expert Consultation?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Get personalized guidance from our immigration experts
              </p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href="/consultations">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Book Consultation
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User view - feedback form
  return (
    <>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Rate This Analysis
          </CardTitle>
          <p className="text-sm text-gray-600">
            Help us improve by rating the accuracy and usefulness of this analysis.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Overall Rating *
              </label>
              {renderStars(rating, true)}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Additional Comments (Optional)
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts about the analysis quality, accuracy, or suggestions for improvement..."
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {feedback.length}/500 characters
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={rating === 0 || submitFeedback.isPending}
              className="w-full"
            >
              {submitFeedback.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Your feedback will be saved and cannot be edited after submission.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h4 className="font-medium text-gray-900 mb-2">Need Expert Consultation?</h4>
          <p className="text-sm text-gray-600 mb-4">
            Get personalized guidance from our immigration experts based on your analysis
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <a href="/consultations">
              <ExternalLink className="h-4 w-4 mr-2" />
              Book Consultation
            </a>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}