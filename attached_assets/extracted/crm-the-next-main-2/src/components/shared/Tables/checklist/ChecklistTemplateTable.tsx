import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { ArrowRight, EditIcon, Trash2 } from "lucide-react";
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
import { Formik } from "formik";
import api from "@/services/api";
import { toast } from "sonner";

export default function ChecklistTemplateTable({
  templates = [],
  fetchData,
}: {
  templates?: any[];
  fetchData: any;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<any | null>(null);

  const openEditDialog = (template: any) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };
  const openDeleteDialog = (template: any) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      await api.delete(`/checklist-template/${templateToDelete.id}`);
      toast.success("Template deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Delete error", error);
      toast.error("Failed to delete template");
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <Formik
            initialValues={{
              name: selectedTemplate?.name || "",
              description: selectedTemplate?.description || "",
            }}
            onSubmit={(values, { setSubmitting }) => {
              api
                .put(`/checklist-template/${selectedTemplate?.id}`, values)
                .then(() => {
                  toast.success("Template updated successfully");
                  fetchData();
                  setIsDialogOpen(false);
                })
                .catch((error) => {
                  console.error("Update error", error);
                  toast.error("Failed to update template");
                })
                .finally(() => setSubmitting(false));
            }}
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Edit Template</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Edit the checklist template details here.
                </DialogDescription>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    onChange={formik.handleChange}
                    value={formik.values.name}
                  />
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    onChange={formik.handleChange}
                    value={formik.values.description}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={formik.isSubmitting}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the template "
              {templateToDelete?.name}"? This action cannot be undone and will
              remove all associated checklist items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col gap-2.5">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8 no-scrollbar">
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
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {templates.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-4 text-sm text-gray-500"
                      >
                        No templates available
                      </td>
                    </tr>
                  ) : (
                    templates.map((template) => (
                      <tr key={template.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {template.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-ellipsis max-w-[300px] overflow-hidden">
                          {template.description}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <Link
                            className="border rounded-full px-10 py-2.5 bg-green-600 text-white"
                            href={`checklist-template/${template.id}`}
                          >
                            Open
                          </Link>
                          <Button
                            variant="outline"
                            onClick={() => openEditDialog(template)}
                          >
                            <EditIcon className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => openDeleteDialog(template)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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
}
