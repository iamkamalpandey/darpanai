import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const TypeConfirmationModal = ({ isOpen, onClose, onConfirm, text }: any) => {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={isOpen ? onConfirm : onClose}>
      <AlertDialogTrigger asChild>
        <div style={{ display: "none" }}>Trigger</div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you wish to continue?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>{text}</AlertDialogDescription>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          {/* <AlertDialogAction asChild> */}
          <Button variant="default" onClick={onConfirm}>
            Confirm
          </Button>
          {/* </AlertDialogAction> */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TypeConfirmationModal;
