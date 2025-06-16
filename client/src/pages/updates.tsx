import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { type Update } from "@shared/schema";
import { ChevronDown, ChevronRight, ExternalLink, AlertCircle, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";

export default function Updates() {
  const { toast } = useToast();
  const [expandedUpdates, setExpandedUpdates] = useState<Set<number>>(new Set());

  // Fetch user updates
  const { data: updates = [], isLoading, error } = useQuery<Update[]>({
    queryKey: ["/api/updates"],
  });

  // Mark update as viewed
  const viewMutation = useMutation({
    mutationFn: (updateId: number) => apiRequest("POST", `/api/updates/${updateId}/view`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/updates"] });
    },
  });

  // Mark action as taken
  const actionMutation = useMutation({
    mutationFn: (updateId: number) => apiRequest("POST", `/api/updates/${updateId}/action`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/updates"] });
      toast({ title: "Success", description: "Action recorded successfully" });
    },
  });

  const toggleExpand = (updateId: number) => {
    const newExpanded = new Set(expandedUpdates);
    if (newExpanded.has(updateId)) {
      newExpanded.delete(updateId);
    } else {
      newExpanded.add(updateId);
      // Mark as viewed when expanded
      viewMutation.mutate(updateId);
    }
    setExpandedUpdates(newExpanded);
  };

  const handleAction = (updateId: number, externalLink?: string) => {
    // Mark action as taken
    actionMutation.mutate(updateId);
    
    // Open external link if provided
    if (externalLink) {
      window.open(externalLink, '_blank', 'noopener,noreferrer');
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "normal": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
      case "high":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load updates</h3>
            <p className="text-gray-500">Please try refreshing the page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading updates...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Updates & Notifications</h1>
          <p className="text-gray-600">Stay informed about important system updates and announcements</p>
        </div>

        {/* Updates List */}
        <div className="space-y-4">
          {updates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Eye className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No updates available</h3>
                <p className="text-gray-500 text-center">You're all caught up! Check back later for new updates.</p>
              </CardContent>
            </Card>
          ) : (
            updates.map((update) => {
              const isExpanded = expandedUpdates.has(update.id);
              const isExpired = update.expiresAt && new Date(update.expiresAt) < new Date();
              
              return (
                <Card key={update.id} className={`transition-all duration-200 ${isExpired ? 'opacity-60' : ''}`}>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <CardHeader 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleExpand(update.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {getPriorityIcon(update.priority)}
                                {update.title}
                              </CardTitle>
                              <Badge variant={getPriorityBadgeVariant(update.priority)}>
                                {update.priority}
                              </Badge>
                              {isExpired && (
                                <Badge variant="outline">Expired</Badge>
                              )}
                            </div>
                            <CardDescription className="text-sm">
                              {update.summary}
                            </CardDescription>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(update.publishedAt), "MMM d, yyyy")}
                              </div>
                              {update.expiresAt && (
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Expires {format(new Date(update.expiresAt), "MMM d, yyyy")}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Full Content */}
                          <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap">{update.content}</p>
                          </div>

                          {/* Call to Action */}
                          {update.callToAction && (
                            <div className="flex justify-start">
                              <Button 
                                onClick={() => handleAction(update.id, update.externalLink || undefined)}
                                disabled={actionMutation.isPending}
                                className="flex items-center gap-2"
                              >
                                {update.externalLink && <ExternalLink className="h-4 w-4" />}
                                {actionMutation.isPending ? "Processing..." : update.callToAction}
                              </Button>
                            </div>
                          )}

                          {/* External Link without CTA */}
                          {update.externalLink && !update.callToAction && (
                            <div className="flex justify-start">
                              <Button 
                                variant="outline"
                                onClick={() => handleAction(update.id, update.externalLink!)}
                                disabled={actionMutation.isPending}
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Learn More
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}