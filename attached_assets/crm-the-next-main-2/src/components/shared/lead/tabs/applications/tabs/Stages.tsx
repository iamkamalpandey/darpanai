import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import Checklist from "./Checklist";
import api from "@/services/api";

export default function StagesTab({
  lead,
  fetchData,
  selectedCourse,
}: {
  lead: any;
  fetchData: any;
  selectedCourse: any;
}) {
  const [checklists, setChecklists] = useState([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templates, setTemplates] = useState([]);
  const [isTemplateAssigned, setIsTemplateAssigned] = useState(false);

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const response = await api.get("/checklist-items", {
          params: {
            leadCourseLeadId: lead.id,
            leadCourseCourseId: selectedCourse.id,
          },
        });
        // Transform the data to include name and description from the checklistItem
        const transformedChecklists = response.data.map((item: any) => ({
          id: item.id,
          name: item.checklistItem.name,
          description: item.checklistItem.description,
          isComplete: item.isComplete,
          checklistItemId: item.checklistItemId,
          leadCourseLeadId: item.leadCourseLeadId,
          leadCourseCourseId: item.leadCourseCourseId,
        }));
        setChecklists(transformedChecklists);
      } catch (error) {
        console.error("Error fetching checklists:", error);
        toast.error("Failed to fetch checklists");
      }
    };

    if (lead.id && selectedCourse.id) {
      fetchChecklists();
    }
  }, [lead.id, selectedCourse.id]);

  useEffect(() => {
    // Fetch checklist templates when the component mounts
    const fetchTemplates = async () => {
      try {
        const response = await api.get("/checklist-template");
        setTemplates(response.data.data);

        // Check if a template is already assigned
        const isAssigned = lead.LeadCourses.some(
          (course: any) => course.template?.items?.length > 0
        );
        setIsTemplateAssigned(isAssigned);
      } catch (error) {
        console.error("Error fetching checklist templates:", error);
        toast.error("Failed to fetch checklist templates");
      }
    };

    fetchTemplates();
  }, [lead]);

  const handleComplete = async (
    checklistItemId: number,
    isComplete: boolean
  ) => {
    try {
      await api.post("update-checklist-status", {
        checklistItemId,
        isComplete,
        leadCourseLeadId: lead.id,
        leadCourseCourseId: selectedCourse.id,
      });

      // Update the local state
      setChecklists((prevChecklists: any) =>
        prevChecklists.map((item: any) =>
          item.checklistItemId === checklistItemId
            ? { ...item, isComplete }
            : item
        )
      );

      fetchData();

      if (isComplete) {
        toast.success("Marked as Complete");
      } else {
        toast.info("Marked as Incomplete");
      }
    } catch (error) {
      console.error("Error updating checklist item:", error);
      toast.error("Failed to update checklist item");
    }
  };

  const handleAssignTemplate = async () => {
    try {
      await api.post("/assign-template", {
        leadId: lead.id,
        courseId: selectedCourse.id, // Pass the selected courseId here
        templateId: Number(selectedTemplate),
      });

      fetchData();
      toast.success("Assigned checklist template successfully");
      setShowAssignDialog(false);
    } catch (error) {
      console.error("Error assigning checklist template:", error);
      toast.error("Failed to assign checklist template");
    }
  };

  const handleUnassignTemplate = async () => {
    try {
      await api.post("/unassign-template", {
        leadId: lead.id,
        courseId: selectedCourse.id,
      });

      fetchData();
      toast.success("Unassigned checklist template successfully");
      setIsTemplateAssigned(false);
    } catch (error) {
      console.error("Error unassigning checklist template:", error);
      toast.error("Failed to unassign checklist template");
    }
  };

  const closeModal = () => {
    setShowAssignDialog(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 w-full">
        {checklists.map((item: any) => (
          <div
            key={item.id}
            className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-grow">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {item.name}
                </h2>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {item.description}
                  </p>
                )}
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    item.isComplete
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {item.isComplete ? "Completed" : "In Progress"}
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <button
                  onClick={() =>
                    handleComplete(item.checklistItemId, !item.isComplete)
                  }
                  className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    item.isComplete
                      ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {item.isComplete ? "Mark as Incomplete" : "Mark as Complete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isTemplateAssigned ? (
        <button
          onClick={handleUnassignTemplate}
          className="bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2 mt-4"
        >
          Unassign Checklist Template
        </button>
      ) : (
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogTrigger asChild>
            <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 mt-4">
              Assign Checklist Template
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Checklist Template</DialogTitle>
              <DialogDescription>
                Select a template to assign to this lead.
                <div className="mt-4">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="border border-gray-200 rounded w-full p-2"
                  >
                    <option value="">Select Template</option>
                    {templates.map((template: any) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleAssignTemplate}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2"
              >
                Assign Template
              </button>
              <button
                onClick={closeModal}
                className="ml-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
