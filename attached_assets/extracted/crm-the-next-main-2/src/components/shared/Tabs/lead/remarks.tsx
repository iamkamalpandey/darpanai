import RemarkCard from "@/components/shared/Remarks/remark-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import api from "@/services/api";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import EmptyRemarks from "@/assets/images/empty-remarks.svg";

const RemarksTab = ({
  remarks,
  fetchData,
}: {
  remarks: any;
  fetchData: any;
}) => {
  const router = useRouter();
  //@ts-ignore
  const { user } = useAuth();
  const [remark, setRemark] = useState("");
  const handleRemarkChange = (e: any) => {
    setRemark(e.target.value);
  };
  const submitRemark = () => {
    if (remark.length < 2) {
      toast.error("Remark Required");
    } else {
      api
        .post("/remark", {
          leadId: router.query.id,
          content: remark,
          userId: user.id,
        })
        .then((response) => {
          toast.success("Remark Added");
          fetchData();
          // router.push("/telecaller/leads");
        })
        .catch((e) => {
          toast.error("Remark not Added");
        });
    }
  };

  // Check if remarks array is empty
  const hasRemarks = remarks.length > 0;

  return (
    <div className="flex flex-col w-full gap-2.5">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Add a Remark</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add a remark</DialogTitle>
            <DialogDescription>
              Please add a remark in the field below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2.5">
            <>
              <div className="col-span-2 flex flex-col gap-2.5">
                <Label htmlFor="">Remark</Label>
                <Textarea
                  onChange={handleRemarkChange}
                  placeholder="Write your remarks.."
                  className="border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          </div>
          <DialogFooter>
            <DialogTrigger asChild>
              <Button
                type="submit"
                onClick={submitRemark}
                className="bg-blue-500 text-white hover:bg-blue-700"
              >
                Save changes
              </Button>
            </DialogTrigger>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Display empty image if remarks array is empty */}
      {!hasRemarks && (
        <div className="flex flex-col items-center justify-center gap-2.5">
          <Image
            src={EmptyRemarks}
            alt="No remarks"
            className="w-full h-40 object-contain "
          />
          <div className="text-center">No remarks yet!</div>
        </div>
      )}
      {/* Display list of remarks if there are any */}
      {hasRemarks &&
        remarks.map((item: any) => {
          return <RemarkCard remark={item} />;
        })}
    </div>
  );
};

export default RemarksTab;
