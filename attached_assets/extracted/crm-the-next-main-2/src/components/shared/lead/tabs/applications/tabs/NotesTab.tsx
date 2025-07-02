import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import React, { useState } from "react";
import { MdAdd } from "react-icons/md";

const NotesTab = () => {
  const [note, setNote] = useState("");
  const notes = [
    {
      id: 1,
      text: "Abcde",
      createdAt: "9 Sunday, 2018",
      createdBy: "Kamal Pandey",
    },
  ];

  const handleNoteChange = (event: any) => {
    setNote(event.target.value);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    // Add logic to handle note submission
  };

  return (
    <div className="p-4 space-y-6">
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex w-full justify-end items-center">
            <Button variant={"outline"} className="flex gap-2.5 items-center">
              <MdAdd /> <span>Add Note</span>
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Textarea
                  value={note}
                  onChange={handleNoteChange}
                  placeholder="Note"
                  className="w-full p-2 border rounded"
                />
                <Button type="submit" className="w-full">
                  Add Note
                </Button>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* <div className="space-y-4">
        {notes.map((item) => (
          <div
            key={item.id}
            className="border rounded p-4 bg-yellow-100 flex flex-col max-w-xs space-y-2"
          >
            <div className="text-lg font-semibold">{item.text}</div>
            <div className="text-sm text-gray-600">
              Created by: {item.createdBy}
            </div>
            <div className="text-sm text-gray-600">
              Created at: {item.createdAt}
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default NotesTab;
