import { useQuery } from "@tanstack/react-query";
import { type UpdateWithViewStatus } from "@shared/schema";

export function useUnreadUpdates() {
  const { data: updates = [] } = useQuery<UpdateWithViewStatus[]>({
    queryKey: ["/api/updates"],
    refetchInterval: 300000, // Refetch every 5 minutes for notifications
  });

  const unreadCount = updates.filter(update => !update.isViewed).length;
  
  return {
    unreadCount,
    hasUnread: unreadCount > 0,
    updates
  };
}