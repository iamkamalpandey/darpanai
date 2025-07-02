import api from "@/services/api";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Select from "react-select";

const CounsellorStatusSelector = ({ lead, fetchLeadDetails }: any) => {
  const [currentStatus, setCurrentStatus] = useState(
    lead?.counsellor_status || false
  );
  const [pendingStatus, setPendingStatus] = useState(
    lead?.counsellor_status || false
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFollowerId, setSelectedFollowerId] = useState("");
  const [validationError, setValidationError] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users when modal opens
  const handleOpenModal = async (status: boolean) => {
    console.log("Setting pending status to:", status);
    setPendingStatus(status);
    setSelectedFollowerId(""); // Reset selected follower when opening modal
    setValidationError("");
    setIsLoading(true);

    try {
      const response = await api.get("user/get-all");
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Could not load users");
    } finally {
      setIsLoading(false);
    }

    setIsModalOpen(true);
  };

  const handleFollowerChange = (selectedOption: any) => {
    setSelectedFollowerId(selectedOption ? selectedOption.value : "");
    setValidationError("");
  };

  const handleConfirm = async () => {
    // Validate follower selection
    if (!selectedFollowerId) {
      setValidationError("You must assign a follower to change the status");
      return;
    }

    setIsLoading(true);

    try {
      // First request: Update counsellor status
      await api.post("/counsellor/update-counsellor-status", {
        leadId: lead.id,
        newStatus: pendingStatus,
      });

      // Second request: Assign follower
      await api.patch("/lead/assign-follower", {
        userId: selectedFollowerId,
        leadId: lead.id,
      });

      toast.success(`Counsellor status updated and follower assigned!`);
      setCurrentStatus(pendingStatus); // Update the current status only after confirmation
      fetchLeadDetails();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Error updating counsellor status or assigning follower");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center space-x-4 w-full">
        <div className="flex w-full items-center gap-2.5 mb-2.5">
          <div>Status:</div>
          <button
            onClick={() => handleOpenModal(!currentStatus)}
            className={`inline-block ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
              currentStatus
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {currentStatus ? "Complete" : "Not Complete"}
          </button>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => !isLoading && setIsModalOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <p>
              The following task will change the Status of Profile to:
              <span
                className={`font-semibold ${
                  pendingStatus ? "text-green-600" : "text-red-600"
                }`}
              >
                {pendingStatus ? " Complete" : " Not Complete"}
              </span>
            </p>

            <div className="space-y-2">
              <Label htmlFor="follower" className="block text-sm font-medium">
                Assign Follower (Required)
              </Label>
              <Select
                id="follower"
                onChange={handleFollowerChange}
                options={users.map((user: any) => ({
                  value: user.id,
                  label: `${user.name} ${
                    user.role?.name ? `(${user.role.name})` : ""
                  }`,
                }))}
                isSearchable
                placeholder="Select a follower"
                className={validationError ? "border-red-500" : ""}
                isDisabled={isLoading}
              />
              {validationError && (
                <p className="text-red-500 text-sm mt-1">{validationError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CounsellorStatusSelector;
