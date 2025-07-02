import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Formik } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { toast } from "sonner";
import Layout from "../layout";
import { PencilIcon, TrashIcon } from "lucide-react";

const ChecklistTemplateDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [template, setTemplate] = useState<any>(null);
  const [items, setItems] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const handleEditItem = async (values: {
    name: string;
    description: string;
  }) => {
    if (!itemToEdit) return;

    try {
      await api.put(`/checklist-item/${itemToEdit.id}`, values);
      toast.success("Checklist item updated successfully");
      fetchTemplateDetails();
      setIsEditDialogOpen(false);
      setItemToEdit(null);
    } catch (error) {
      console.error("Error updating checklist item:", error);
      toast.error("Failed to update checklist item");
    }
  };
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      //@ts-ignore
      await api.delete(`/checklist-item/${itemToDelete.id}`);
      toast.success("Checklist item deleted successfully");
      fetchTemplateDetails();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting checklist item:", error);
      toast.error("Failed to delete checklist item");
    }
  };
  const fetchTemplateDetails = async () => {
    try {
      const response = await api.get(`/checklist-template/${id}`);
      setTemplate(response.data.data);
      setItems(response.data.data.items);
    } catch (error) {
      console.error("Error fetching template details:", error);
      toast.error("Failed to fetch template details");
    }
  };

  useEffect(() => {
    if (id) {
      fetchTemplateDetails();
    }
  }, [id]);

  const handleAddItem = async (values: {
    name: string;
    description: string;
  }) => {
    try {
      await api.post(`/checklist-item`, {
        ...values,
        templateId: Number(id),
      });
      toast.success("Checklist item added successfully");
      fetchTemplateDetails();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding checklist item:", error);
      toast.error("Failed to add checklist item");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        {template && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              {template.name}
            </h1>
            <p className="text-gray-600 mt-2">{template.description}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Checklist Items
          </h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button>Add Checklist Item</Button>
            </DialogTrigger>
            <DialogContent>
              <Formik
                initialValues={{ name: "", description: "" }}
                onSubmit={(values, { setSubmitting }) => {
                  handleAddItem(values).finally(() => setSubmitting(false));
                }}
              >
                {(formik) => (
                  <form onSubmit={formik.handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Add Checklist Item</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      Add the checklist item details here.
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
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.description}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setItemToEdit(item);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <PencilIcon className="h-5 w-5 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setItemToDelete(item);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <TrashIcon className="h-5 w-5 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <Formik
            initialValues={{
              name: itemToEdit?.name || "",
              description: itemToEdit?.description || "",
            }}
            enableReinitialize
            onSubmit={(values, { setSubmitting }) => {
              handleEditItem(values).finally(() => setSubmitting(false));
            }}
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Edit Checklist Item</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Edit the checklist item details here.
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this checklist item? This action
            cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ChecklistTemplateDetails;
