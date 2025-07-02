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
import { Label } from "@/components/ui/label";

const FollowupModal = ({ lead, fetchData }: { lead: any; fetchData: any }) => {
  //@ts-ignore
  const { user } = useAuth();
  const [followUpDate, setFollowUpDate] = useState<any>(null);
  const handleSaveChanges = (e: any) => {
    e.preventDefault();
    const isoDate = followUpDate.toISOString();
    setFollowUpDate(isoDate);
    api
      .post("follow-up", {
        leadId: lead.id,
        userId: user.id,
        date: isoDate,
      })
      .then((response) => {
        toast.success("FollowUp Added Successfully!");
        fetchData();
      });
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add FollowUp Date</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSaveChanges}>
          <DialogHeader>
            <DialogTitle>Add a followup date</DialogTitle>
            <DialogDescription>Followup date</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="col-span-2 flex flex-col">
              <Label>Follow-up Date</Label>
              <DatePicker
                selected={followUpDate}
                onChange={(date: Date) => setFollowUpDate(date)}
                className="block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                dateFormat="MM/dd/yyyy"
                peekNextMonth
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogTrigger asChild>
              <Button type="submit">Save changes</Button>
            </DialogTrigger>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FollowupModal;
