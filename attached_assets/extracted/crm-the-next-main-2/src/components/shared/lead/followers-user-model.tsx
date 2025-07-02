import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import React, { useState } from "react";
import { toast } from "sonner";
import Select from "react-select";

const FollowersUserModel = ({
  users,
  leadId,
  fetchLeadData,
}: {
  users: any;
  leadId: any;
  fetchLeadData: any;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    //@ts-ignore
    const selectedValue = event ? event.value : "";
    const selectedUser = users.find((user: any) => user.id === selectedValue);
    setSelectedUser(selectedUser);
    setSelectedUserId(selectedValue);
  };
  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user and at least one lead.");
      return;
    }
    try {
      const response = await api.patch("lead/assign-follower", {
        userId: selectedUserId,
        leadId: leadId,
      });
      toast.success("Lead Follower Added Successfully");

      //   console.log(response);
      closeDialog();
      fetchLeadData();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <Button variant="outline" onClick={openDialog}>
        Assign User
      </Button>
      {isDialogOpen && (
        <Dialog open={isDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Follower</DialogTitle>
            </DialogHeader>
            <div className="col-span-2 ">
              <Label htmlFor="name mb-2.5">Assign Followers</Label>
              <Select
                id="assignedUser"
                // value={selectedUser}
                //@ts-ignore
                onChange={handleUserChange}
                name="assignedUser"
                options={users.map((user: any) => ({
                  value: user.id,
                  label: user.name,
                }))}
                isSearchable
                placeholder="Select User"
              />
            </div>

            <DialogFooter>
              <Button variant={"default"} onClick={handleSubmit}>
                Assign Follower
              </Button>
              <Button variant="outline" onClick={closeDialog}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default FollowersUserModel;
