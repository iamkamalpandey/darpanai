import { useQuery } from "@tanstack/react-query";
import { type UpdateWithViewStatus } from "@shared/schema";

export function useUnreadUpdates() {
  const { data: updates = [] } = useQuery<UpdateWithViewStatus[]>({
    queryKey: ["/api/updates"],
    refetchInterval: 900000, // Refetch every 15 minutes for better performance
    staleTime: 10 * 60 * 1000, // 10 minutes stale time
  });

  const unreadCount = updates.filter(update => !update.isViewed).length;
  
  return {
    unreadCount,
    hasUnread: unreadCount > 0,
    updates
  };
}