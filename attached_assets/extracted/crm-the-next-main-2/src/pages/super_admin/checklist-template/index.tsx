import Header from "@/components/shared/Header/Header";
import Sidebar from "@/components/shared/Sidebar/Sidebar";
import React, { useEffect, useState } from "react";
import Layout from "../layout";
import ChecklistTemplateTable from "@/components/shared/Tables/checklist/ChecklistTemplateTable";
import api from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Formik } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@radix-ui/react-dialog";

const index = () => {
  const [data, setData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fetchData = () => {
    api.get("checklist-template").then((response) => {
      setData(response.data.data);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      <Layout>
        <Header title={"Checklist Template"} />
        <div className="p-2.5">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button>Add New Template</Button>
            </DialogTrigger>
            <DialogContent>
              <Formik
                initialValues={{
                  name: "",
                  description: "",
                }}
                onSubmit={(values, { setSubmitting }) => {
                  api
                    .post(`/checklist-template/`, values)
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
                      <DialogTitle>Add Template</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      Add the checklist template details here.
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
          <ChecklistTemplateTable fetchData={fetchData} templates={data} />
        </div>
      </Layout>
    </>
  );
};

export default index;
