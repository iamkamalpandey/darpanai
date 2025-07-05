import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  DollarSign, 
  Calendar, 
  GraduationCap, 
  Heart, 
  HeartOff,
  ExternalLink,
  MessageCircle,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

interface ScholarshipProgram {
  id: number;
  name: string;
  description: string;
  amountDisplay: string;
  deadline: string;
  levelOfStudy: string[];
  needBased: boolean;
  meritBased: boolean;
  tags: string[];
  eligibilitySummary: string[];
  requiredDocuments: string[];
  applicationUrl: string;
  provider: {
    id: number;
    name: string;
    website: string;
  };
}

interface ScholarshipMatch {
  scholarship: ScholarshipProgram;
  matchScore: number;
  matchReasons: string[];
  isSaved?: boolean;
}

const ScholarshipRecommendations: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipMatch | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch personalized recommendations
  const { data: recommendationsData, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['scholarship-recommendations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/scholarships/recommendations');
      return response;
    },
  });

  // Fetch saved scholarships
  const { data: savedData, isLoading: isLoadingSaved } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/scholarships/user/saved');
      return response;
    },
  });

  // Save/unsave scholarship mutation
  const toggleSaveMutation = useMutation({
    mutationFn: ({ scholarshipId, save }: { scholarshipId: number, save: boolean }) => {
      if (save) {
        return apiRequest('POST', `/api/scholarships/${scholarshipId}/save`);
      } else {
        return apiRequest('DELETE', `/api/scholarships/${scholarshipId}/save`);
      }
    },
    onSuccess: (_, { save }) => {
      toast({ 
        title: save ? 'Scholarship saved!' : 'Scholarship removed from saved list',
        variant: 'default'
      });
      queryClient.invalidateQueries({ queryKey: ['scholarship-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update scholarship', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Contact for guidance mutation
  const contactMutation = useMutation({
    mutationFn: (data: { scholarshipId: number, message: string }) => 
      apiRequest('POST', `/api/scholarships/${data.scholarshipId}/inquire`, {
        inquiry_type: 'guidance',
        message: data.message
      }),
    onSuccess: () => {
      toast({ title: 'Message sent! Our experts will contact you within 24 hours.' });
      setContactDialogOpen(false);
      setContactMessage('');
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to send message', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { text: 'Deadline passed', urgent: true };
    if (daysUntil <= 7) return { text: `${daysUntil} days left`, urgent: true };
    if (daysUntil <= 30) return { text: `${daysUntil} days left`, urgent: false };
    
    return { text: date.toLocaleDateString(), urgent: false };
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const recommendations = (recommendationsData as any)?.recommendations || [];
  const filteredRecommendations = recommendations.filter((match: ScholarshipMatch) =>
    searchQuery === '' || 
    match.scholarship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.scholarship.provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.scholarship.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const savedScholarships = (savedData as any)?.scholarships || [];
  const savedScholarshipIds = savedScholarships.map((s: ScholarshipMatch) => s.scholarship.id);

  const isLoading = isLoadingRecommendations || isLoadingSaved;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scholarship Recommendations</h1>
          <p className="text-gray-600">Personalized scholarships matched to your profile</p>
        </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search scholarships by name, provider, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Recommendations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recommended for You</span>
                <Badge variant="secondary">{filteredRecommendations?.length || 0} matches</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredRecommendations?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No matching scholarships found.</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or update your profile for better matches.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecommendations?.map((match) => {
                    const deadline = formatDeadline(match.scholarship.deadline);
                    const isSaved = savedScholarshipIds.includes(match.scholarship.id);
                    
                    return (
                      <div key={match.scholarship.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              {match.scholarship.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{match.scholarship.provider.name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {match.scholarship.amountDisplay}
                              </span>
                              <span className={`flex items-center gap-1 ${deadline.urgent ? 'text-red-600 font-medium' : ''}`}>
                                <Calendar className="h-4 w-4" />
                                {deadline.text}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={`${getMatchScoreColor(match.matchScore)} border`}
                            >
                              {match.matchScore}% match
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSaveMutation.mutate({ 
                                scholarshipId: match.scholarship.id, 
                                save: !isSaved 
                              })}
                            >
                              {isSaved ? <HeartOff className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {match.scholarship.description}
                        </p>

                        {/* Match Reasons */}
                        {match.matchReasons.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Why it matches:</p>
                            <div className="flex flex-wrap gap-2">
                              {match.matchReasons.map((reason, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {match.scholarship.levelOfStudy.map((level) => (
                            <Badge key={level} variant="secondary" className="text-xs">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {level}
                            </Badge>
                          ))}
                          {match.scholarship.needBased && (
                            <Badge variant="secondary" className="text-xs">Need-based</Badge>
                          )}
                          {match.scholarship.meritBased && (
                            <Badge variant="secondary" className="text-xs">Merit-based</Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => window.open(match.scholarship.applicationUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Apply Now
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedScholarship(match);
                              setContactDialogOpen(true);
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Get Guidance
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Saved Scholarships Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saved Scholarships</CardTitle>
            </CardHeader>
            <CardContent>
              {savedScholarships.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No saved scholarships yet. Click the heart icon to save scholarships.
                </p>
              ) : (
                <div className="space-y-3">
                  {savedScholarships.map((match) => {
                    const deadline = formatDeadline(match.scholarship.deadline);
                    
                    return (
                      <div key={match.scholarship.id} className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
                          {match.scholarship.name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">{match.scholarship.provider.name}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">{match.scholarship.amountDisplay}</span>
                          <span className={`text-xs ${deadline.urgent ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {deadline.text}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-xs"
                            onClick={() => window.open(match.scholarship.applicationUrl, '_blank')}
                          >
                            Apply
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleSaveMutation.mutate({ 
                              scholarshipId: match.scholarship.id, 
                              save: false 
                            })}
                          >
                            <HeartOff className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Get Scholarship Guidance</DialogTitle>
            <DialogDescription>
              {selectedScholarship && (
                <div className="mt-2">
                  <p className="font-medium text-gray-900">{selectedScholarship.scholarship.name}</p>
                  <p className="text-sm text-gray-600">{selectedScholarship.scholarship.provider.name}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Tell us what guidance you need for this scholarship application..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedScholarship && contactMessage.trim()) {
                  contactMutation.mutate({
                    scholarshipId: selectedScholarship.scholarship.id,
                    message: contactMessage
                  });
                }
              }}
              disabled={!contactMessage.trim() || contactMutation.isPending}
            >
              {contactMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ScholarshipRecommendations;