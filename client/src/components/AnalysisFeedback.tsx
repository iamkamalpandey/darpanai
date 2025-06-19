import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

interface AnalysisFeedbackProps {
  analysisId: number;
  analysisType: 'visa' | 'enrollment';
}

interface FeedbackData {
  id?: number;
  rating: number;
  feedback: string;
  createdAt?: string;
}

export function AnalysisFeedback({ analysisId, analysisType }: AnalysisFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch existing feedback
  const { data: existingFeedback, isLoading } = useQuery({
    queryKey: [`/api/analyses/${analysisId}/feedback`],
    enabled: !!analysisId,
  });

  // Set form data from existing feedback
  useEffect(() => {
    if (existingFeedback) {
      setRating((existingFeedback as any).overallRating || 0);
      setFeedback((existingFeedback as any).feedback || '');
    }
  }, [existingFeedback]);

  // Submit feedback (one-time only)
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
      queryClient.invalidateQueries({ queryKey: [`/api/analyses/${analysisId}/feedback`] });
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
        description: "Thank you for your feedback! Your review has been saved and cannot be edited.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 transition-colors"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => !(existingFeedback as any)?.id && setRating(star)}
            disabled={!!(existingFeedback as any)?.id}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoveredStar || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              } ${(existingFeedback as any)?.id ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 && `${rating}/5 stars`}
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

  // Show read-only feedback if already submitted
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
            {renderStars()}
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
        </CardContent>
      </Card>
    );
  }

  // Show feedback form for new submissions
  return (
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
            {renderStars()}
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
  );
}