import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CampaignListProps {
  campaigns: any[];
  onDelete: (id: number) => Promise<void>;
  isLoading: boolean;
}

export function CampaignList({
  campaigns,
  onDelete,
  isLoading,
}: CampaignListProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await onDelete(deleteId);
        toast.success("Campaign deleted successfully");
      } catch (error) {
        toast.error("Failed to delete campaign");
      } finally {
        setDeleteId(null);
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => router.push("/super_admin/campaigns/create")}>
          Create Campaign
        </Button>
      </div>

      <Table className="border rounded-lg shadow-sm">
        <TableHeader className="rounded-t-lg bg-slate-50">
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.title}</TableCell>
              <TableCell>{campaign.platform}</TableCell>
              <TableCell>{campaign.status}</TableCell>
              <TableCell>
                {campaign.startDate
                  ? format(new Date(campaign.startDate), "PP")
                  : "-"}
              </TableCell>
              <TableCell>
                {campaign.endDate
                  ? format(new Date(campaign.endDate), "PP")
                  : "-"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/campaigns/${campaign.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteId(campaign.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
