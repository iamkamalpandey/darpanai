import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CampaignFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function CampaignForm({
  initialData,
  onSubmit,
  isLoading,
}: CampaignFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {},
  });

  const onSubmitForm = async (data: any) => {
    try {
      await onSubmit(data);
      toast.success(
        initialData
          ? "Campaign updated successfully"
          : "Campaign created successfully"
      );
      router.push("/super_admin/campaigns");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <div className="p-2.5">
        <div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              // error={errors.title?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input type="date" id="startDate" {...register("startDate")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input type="date" id="endDate" {...register("endDate")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input type="number" id="budget" {...register("budget")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Target Leads</Label>
              <Input type="number" id="target" {...register("target")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Input id="platform" {...register("platform")} />
          </div>

          <div className="flex justify-end space-x-4 mt-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/campaigns")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
