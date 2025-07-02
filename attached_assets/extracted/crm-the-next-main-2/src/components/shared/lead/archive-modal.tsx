import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";

import React, { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ArchiveModal = ({ lead, fetchData }: { lead: any; fetchData: any }) => {
  const [reason, setReason] = useState("");
  const handleReason = (e: any) => {
    setReason(e.target.value);
  };
  const handleArchive = () => {
    if (reason.length < 2) {
      toast.error("Reason Required");
    } else {
      api
        .post("/archive", { leadId: lead.id, reason: reason })
        .then((response) => {
          toast.success("Lead Archived");
          fetchData();
          // router.push("/telecaller/leads");
        })
        .catch((e) => {
          toast.error("Lead not Archived");
        });
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-red-500 hover:bg-red-700">Archive data</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to archive Data?</DialogTitle>
          <DialogDescription>Please add a valid reason</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <>
            <div className="col-span-2 flex flex-col">
              <Label className="mb-2.5">Reason for Archive</Label>
              <Textarea
                onChange={handleReason}
                placeholder="Write your reason.."
              />
            </div>
          </>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleArchive}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveModal;
