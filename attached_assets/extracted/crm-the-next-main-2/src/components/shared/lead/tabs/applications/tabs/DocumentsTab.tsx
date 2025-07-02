//@ts-nocheck
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, ExternalLinkIcon, Download, TrashIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const ApplicationDocuments = ({ lead, fetchData, currentCourseId }) => {
  const [checklists, setChecklists] = useState([]);

  useEffect(() => {
    // Fetch checklist items when the component mounts
    const fetchChecklists = () => {
      const checklistsData = lead.LeadCourses.flatMap((course: any) =>
        course.template?.items
          ? course.template.items.map((item: any) => ({
              id: item.leadChecklists?.[0]?.id || `temp-${Math.random()}`, // Use temporary ID if not present
              name: item.name,
              description: item.description,
              isComplete: item.leadChecklists?.[0]?.isComplete || false,
              checklistItemId: item.id,
              leadCourseLeadId: lead.id,
              leadCourseCourseId: course.courseId,
            }))
          : []
      );
      setChecklists(checklistsData);
    };

    fetchChecklists();
  }, [lead]);
  const [activeItem, setActiveItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };
  //@ts-ignore
  const { user } = useAuth();
  const handleUpload = async (event) => {
    event.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", activeItem.name);
    formData.append("userId", user.id);
    formData.append("leadId", lead.id);
    formData.append("checklistItemId", activeItem.id);
    formData.append("courseId", currentCourseId); // Add this line
    console.log(activeItem.name);
    try {
      const response = await api.post("/documents", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });
      toast.success("Document uploaded successfully!");
      setFile(null);
      setTitle("");
      setProgress(0);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload document.");
    }
    setUploading(false);
  };

  const handleDocumentAction = async (documentUrl, type, action) => {
    try {
      const response = await api.get(`/documents/temporary-access`, {
        params: { url: documentUrl, type: type },
      });
      const presignedUrl = response.data.presignedUrl;

      if (action === "download") {
        window.open(presignedUrl, "_blank");
      } else {
        window.open(presignedUrl, "_blank");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate temporary access.");
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await api.delete(`/documents/${documentId}`);
      toast.success("Document deleted successfully!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete document.");
    }
  };

  return (
    <div className="flex">
      {/* Checklist Items */}
      <div className="w-1/3 pr-4">
        <h2 className="text-xl font-bold mb-4">Checklist Items</h2>
        {checklists.map((item) => (
          <div
            key={item.id}
            className={`p-2 mb-2 rounded cursor-pointer ${
              activeItem?.id === item.id ? "bg-blue-100" : "bg-gray-100"
            }`}
            onClick={() => setActiveItem(item)}
          >
            {item.name}
          </div>
        ))}
      </div>

      {/* Document Upload and List */}
      <div className="w-2/3">
        {activeItem && (
          <>
            <h2 className="text-xl font-bold mb-4">
              Documents for {activeItem.name}
            </h2>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mb-4">
                  <Upload className="mr-2 h-4 w-4" /> Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <Input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Document Title"
                  />
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                  />
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload Document"}
                  </Button>
                  {uploading && (
                    <Progress value={progress} className="w-full" />
                  )}
                </form>
              </DialogContent>
            </Dialog>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lead?.Document.filter(
                    (doc) =>
                      doc.type === activeItem.name &&
                      doc.courseId === currentCourseId
                  ).map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {doc.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="link"
                          onClick={() =>
                            handleDocumentAction(doc.url, doc.type, "view")
                          }
                        >
                          <ExternalLinkIcon className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="link"
                          onClick={() =>
                            handleDocumentAction(doc.url, doc.type, "download")
                          }
                        >
                          <Download className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <TrashIcon className="h-5 w-5 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationDocuments;
