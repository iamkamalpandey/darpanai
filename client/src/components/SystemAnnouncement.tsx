import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SystemAnnouncement() {
  const [dismissed, setDismissed] = useState(false);
  
  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/system-stats"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const announcement = (systemStats as any)?.systemAnnouncement;

  if (!announcement || announcement.trim() === '' || dismissed) {
    return null;
  }

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50 border-l-4 border-l-blue-500">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <AlertDescription className="text-blue-800 font-medium">
            {announcement}
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}