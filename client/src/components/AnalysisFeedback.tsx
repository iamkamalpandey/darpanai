import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  Send 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AnalysisFeedbackProps {
  analysisId: number;
  analysisType: 'visa' | 'enrollment';
}

interface FeedbackData {
  id?: number;
  isAccurate?: boolean;
  isHelpful?: boolean;
  accuracyRating?: number;
  helpfulnessRating?: number;
  clarityRating?: number;
  overallRating?: number;
  feedback?: string;
  improvementSuggestions?: string;
  feedbackCategories?: string[];
}

export function AnalysisFeedback({ analysisId, analysisType }: AnalysisFeedbackProps) {
  const [showDetailed, setShowDetailed] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [ratings, setRatings] = useState({
    accuracy: 0,
    helpfulness: 0,
    clarity: 0,
    overall: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing feedback
  const { data: existingFeedback } = useQuery<FeedbackData>({
    queryKey: [`/api/analyses/${analysisId}/feedback`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: Partial<FeedbackData>) => {
      const endpoint = `/api/analyses/${analysisId}/feedback`;
      const method = existingFeedback ? 'PATCH' : 'POST';
      
      const requestData = method === 'POST' 
        ? { analysisType, ...feedbackData }
        : feedbackData;
        
      return fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(requestData),
      }).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! It helps us improve our analysis quality.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/analyses/${analysisId}/feedback`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Quick feedback handlers
  const handleQuickFeedback = (type: 'accuracy' | 'helpfulness', value: boolean) => {
    const feedbackData = {
      [type === 'accuracy' ? 'isAccurate' : 'isHelpful']: value,
    };
    submitFeedbackMutation.mutate(feedbackData);
  };

  // Star rating handler
  const handleRating = (type: keyof typeof ratings, value: number) => {
    const newRatings = { ...ratings, [type]: value };
    setRatings(newRatings);
    
    const feedbackData = {
      [`${type}Rating`]: value,
    };
    submitFeedbackMutation.mutate(feedbackData);
  };

  // Detailed feedback handler
  const handleDetailedFeedback = () => {
    const feedbackData = {
      feedback: feedback.trim() || undefined,
      improvementSuggestions: suggestions.trim() || undefined,
    };
    submitFeedbackMutation.mutate(feedbackData);
    setFeedback('');
    setSuggestions('');
    setShowDetailed(false);
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string; 
  }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium min-w-[80px]">{label}:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="hover:scale-110 transition-transform"
          >
            <Star
              className={`h-4 w-4 ${
                star <= value 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Rate this Analysis
            </h3>
            {existingFeedback && (
              <Badge variant="secondary" className="text-xs">
                Feedback submitted
              </Badge>
            )}
          </div>

          {/* Quick Feedback - Google-style thumbs up/down */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Was this analysis accurate?</span>
            <div className="flex gap-2">
              <Button
                variant={existingFeedback?.isAccurate === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFeedback('accuracy', true)}
                disabled={submitFeedbackMutation.isPending}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                Yes
              </Button>
              <Button
                variant={existingFeedback?.isAccurate === false ? "destructive" : "outline"}
                size="sm"
                onClick={() => handleQuickFeedback('accuracy', false)}
                disabled={submitFeedbackMutation.isPending}
                className="flex items-center gap-1"
              >
                <ThumbsDown className="h-4 w-4" />
                No
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Was this analysis helpful?</span>
            <div className="flex gap-2">
              <Button
                variant={existingFeedback?.isHelpful === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFeedback('helpfulness', true)}
                disabled={submitFeedbackMutation.isPending}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                Yes
              </Button>
              <Button
                variant={existingFeedback?.isHelpful === false ? "destructive" : "outline"}
                size="sm"
                onClick={() => handleQuickFeedback('helpfulness', false)}
                disabled={submitFeedbackMutation.isPending}
                className="flex items-center gap-1"
              >
                <ThumbsDown className="h-4 w-4" />
                No
              </Button>
            </div>
          </div>

          {/* Expandable detailed feedback */}
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailed(!showDetailed)}
              className="flex items-center gap-2 text-sm"
            >
              <MessageSquare className="h-4 w-4" />
              Provide detailed feedback
              {showDetailed ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showDetailed && (
              <div className="mt-4 space-y-4">
                {/* Star ratings */}
                <div className="space-y-3">
                  <StarRating
                    label="Accuracy"
                    value={ratings.accuracy}
                    onChange={(value) => handleRating('accuracy', value)}
                  />
                  <StarRating
                    label="Helpfulness"
                    value={ratings.helpfulness}
                    onChange={(value) => handleRating('helpfulness', value)}
                  />
                  <StarRating
                    label="Clarity"
                    value={ratings.clarity}
                    onChange={(value) => handleRating('clarity', value)}
                  />
                  <StarRating
                    label="Overall"
                    value={ratings.overall}
                    onChange={(value) => handleRating('overall', value)}
                  />
                </div>

                {/* Text feedback */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Additional feedback
                    </label>
                    <Textarea
                      placeholder="Tell us what you think about this analysis..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      How can we improve?
                    </label>
                    <Textarea
                      placeholder="What could be better or what was missing?"
                      value={suggestions}
                      onChange={(e) => setSuggestions(e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>

                  <Button
                    onClick={handleDetailedFeedback}
                    disabled={submitFeedbackMutation.isPending || (!feedback.trim() && !suggestions.trim())}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Feedback
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}