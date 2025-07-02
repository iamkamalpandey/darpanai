import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner"; // Assuming you have react-toastify installed
import api from "@/services/api";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DeleteIcon,
  Download,
  ExternalLinkIcon,
  TrashIcon,
  Upload,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
const DocumentsTab = ({ lead, fetchData }: { lead: any; fetchData: any }) => {
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(""); // academic or passport
  const [uploading, setUploading] = useState(false);
  //@ts-ignore
  const { user } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //@ts-ignore
    setFile(event.target.files[0]);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value);
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setType("");
    setProgress(0);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploading(true);

    const formData = new FormData();
    //@ts-ignore
    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", type);
    formData.append("userId", user.id);
    formData.append("leadId", lead.id);

    try {
      const response = await api.post("/documents", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            //@ts-ignore
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });
      console.log(response.data);
      toast.success("Document uploaded successfully!");
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload document.");
    }
    setUploading(false);
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  const handleDelete = async (documentId: any) => {
    try {
      await api.delete(`/documents/${documentId}`);
      toast.success("Document deleted successfully!");
      fetchData(); // Refresh data after deletion
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete document.");
    }
    setIsDialogOpen(false); // Close dialog
  };
  const handleDocumentClick = async (
    documentUrl: string,
    type: string,
    download = false
  ) => {
    try {
      const response = await api.get(`/documents/temporary-access`, {
        params: {
          url: documentUrl,
          type: type,
        },
      });

      const presignedUrl = response.data.presignedUrl;

      if (download) {
        // Attempt to open the URL in a new tab which may prompt the user to download the file
        const newTab = window.open(presignedUrl, "_blank");
        if (newTab) {
          newTab.document.title = "Downloading..."; // Optional: Set a title for the new tab
        } else {
          toast.error("Popup blocker might have prevented the download.");
        }
      } else {
        // Open URL in a new tab for preview
        window.open(presignedUrl, "_blank");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate temporary access.");
    }
  };
  return (
    <div className="p-4">
      <Dialog open={isDialogOpen}>
        <DialogTrigger asChild>
          <Button className="hidden">Open Delete Confirmation</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant={"default"}
              onClick={() => handleDelete(documentToDelete)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex w-full justify-end items-center">
            <Button
              variant={"outline"}
              className="flex gap-2.5 w-full items-center"
            >
              <Upload /> <span>Upload Document</span>
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Fill in the details below to upload a document.
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Document Title"
                />
                <select
                  value={type}
                  onChange={handleTypeChange}
                  className="border border-gray-200 rounded w-full"
                >
                  <option value="">Select Type</option>
                  <option value="academic">Academic</option>
                  <option value="passport">Passport</option>
                  <option value="other">Other</option>
                </select>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                />
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Document"}
                </Button>
                {uploading && (
                  <Progress
                    value={progress}
                    className="w-full bg-gray-200 h-1"
                  />
                )}
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className=" flex flex-col mt-2.5">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>

                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-gray-900"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-gray-900"
                    >
                      Created By
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-gray-900"
                    >
                      Created At
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-center"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {!lead?.Document.length ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">
                        No Documents found
                      </td>
                    </tr>
                  ) : (
                    lead?.Document.map((item: any) => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {item.title}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500 items-center flex w-full justify-center">
                          {item.type}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
                          {item.user.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
                          {item && formatDate(item?.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center flex justify-center items-center space-x-2">
                          <Button
                            variant={"link"}
                            onClick={() =>
                              handleDocumentClick(item.url, item.type)
                            }
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <ExternalLinkIcon className="h-6 w-6" />
                          </Button>
                          <Button
                            variant={"link"}
                            onClick={() =>
                              handleDocumentClick(item.url, item.type, true)
                            }
                            className="text-green-500 hover:text-green-600"
                          >
                            <Download className="h-6 w-6" />
                          </Button>
                          <Button
                            variant="link"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => {
                              setIsDialogOpen(true);
                              setDocumentToDelete(item.id);
                            }}
                          >
                            <TrashIcon />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;
