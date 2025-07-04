// components/lead-details/ielts-book-status-modal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Check } from "lucide-react"; // Import the Check icon
import api from "@/services/api";

interface IeltsBookStatusModalProps {
  lead: any;
  fetchLeadDetails: () => void;
  userRole: string; // Pass the user role for conditional rendering
}

export const IeltsBookStatusModal: React.FC<IeltsBookStatusModalProps> = ({
  lead,
  fetchLeadDetails,
  userRole,
}) => {
  const [ieltsBookTaken, setIeltsBookTaken] = useState(
    lead?.ielts_book_taken || false
  );
  const [pteBookTaken, setPteBookTaken] = useState(
    lead?.pte_book_taken || false
  );
  const [toeflBookTaken, setToeflBookTaken] = useState(
    lead?.toefl_book_taken || false
  );
  const [satBookTaken, setSatBookTaken] = useState(
    lead?.sat_book_taken || false
  );

  // Update local state when lead prop changes (e.g., when modal opens or parent refreshes)
  useEffect(() => {
    setIeltsBookTaken(lead?.ielts_book_taken || false);
    setPteBookTaken(lead?.pte_book_taken || false);
    setToeflBookTaken(lead?.toefl_book_taken || false);
    setSatBookTaken(lead?.sat_book_taken || false);
  }, [lead]);

  const handleBookTakenChange = async (
    bookType: "ielts" | "pte" | "toefl" | "sat",
    currentStatus: boolean // The status before the change
  ) => {
    const newStatus = !currentStatus; // Calculate the new status

    try {
      await api.put(`/lead/${lead.id}`, {
        [`${bookType}_book_taken`]: newStatus,
      });
      toast.success(
        `${bookType.toUpperCase()} book status updated successfully!`
      );
      fetchLeadDetails(); // Refresh lead details in the parent component
    } catch (error) {
      console.error(`Error updating ${bookType} book status:`, error);
      toast.error(`Failed to update ${bookType} book status.`);
      // If API fails, revert the local state to original for accuracy
      switch (bookType) {
        case "ielts":
          setIeltsBookTaken(currentStatus);
          break;
        case "pte":
          setPteBookTaken(currentStatus);
          break;
        case "toefl":
          setToeflBookTaken(currentStatus);
          break;
        case "sat":
          setSatBookTaken(currentStatus);
          break;
        default:
          break;
      }
    }
  };

  const isAcademicsOrAdmin =
    userRole === "ACADEMICS" || userRole === "SUPER_ADMIN";

  // Helper function to render the switch with a checkmark and border
  const renderBookSwitch = (
    id: string,
    label: string,
    checked: boolean,
    onConfirm: () => void,
    disabled: boolean
  ) => (
    <div className="flex items-center justify-between p-2 border rounded-md">
      {" "}
      {/* Added border and padding */}
      <Label htmlFor={id}>{label}</Label>
      <ConfirmationDialog
        onConfirm={onConfirm}
        title={`Confirm ${checked ? "Unmark" : "Mark"} ${label.replace(
          " Book Taken",
          ""
        )} Book`}
        description={`Are you sure you want to ${
          checked ? "unmark" : "mark"
        } the ${label.replace(" Book Taken", "")} book as ${
          checked ? "not taken" : "taken"
        }?`}
        triggerButtonText=""
      >
        <div className="relative">
          {" "}
          {/* Use relative positioning for the icon */}
          <Switch
            id={id}
            checked={checked}
            onCheckedChange={() => {}} // Handled by ConfirmationDialog
            disabled={disabled}
          />
          {checked && (
            <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
          )}
        </div>
      </ConfirmationDialog>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {isAcademicsOrAdmin && (
          <Button variant="outline" className="w-full mt-4">
            Manage Book Status
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Book Status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {renderBookSwitch(
            "ielts-book",
            "IELTS Book Taken",
            ieltsBookTaken,
            () => handleBookTakenChange("ielts", ieltsBookTaken),
            !isAcademicsOrAdmin
          )}
          {renderBookSwitch(
            "pte-book",
            "PTE Book Taken",
            pteBookTaken,
            () => handleBookTakenChange("pte", pteBookTaken),
            !isAcademicsOrAdmin
          )}
          {renderBookSwitch(
            "toefl-book",
            "TOEFL Book Taken",
            toeflBookTaken,
            () => handleBookTakenChange("toefl", toeflBookTaken),
            !isAcademicsOrAdmin
          )}
          {renderBookSwitch(
            "sat-book",
            "SAT Book Taken",
            satBookTaken,
            () => handleBookTakenChange("sat", satBookTaken),
            !isAcademicsOrAdmin
          )}
        </div>
        <DialogFooter>
          {/* No specific action button needed here as switches update on confirm */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
interface ConfirmationDialogProps {
  onConfirm: () => void;
  title: string;
  description: string;
  triggerButtonText: string;
  children?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  onConfirm,
  title,
  description,
  triggerButtonText,
  children,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || <Button variant="outline">{triggerButtonText}</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};