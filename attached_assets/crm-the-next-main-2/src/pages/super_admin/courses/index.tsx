import React, { useState } from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import api from "@/services/api";
import CoursesTable from "@/components/shared/Tables/courses/CoursesTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InstitutionDropdown from "@/components/shared/dropdown/InstitutionDropdown";

const Index = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);

  const handleInstitutionSelect = (institution: any) => {
    setSelectedInstitution(institution);
  };

  // Formik setup for form handling, validation with Yup
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      description: Yup.string().required("Description"),
    }),
    onSubmit: (values, { setSubmitting, resetForm }) => {
      const payload = {
        ...values,
        institutionId: selectedInstitution?.id,
      };
      api.post("courses", payload).then(() => {
        setSubmitting(false);
        resetForm();
        setIsDialogOpen(false);
        toast.success("Course Added Successfully!");
        // refetch();
      });
    },
  });

  return (
    <Layout>
      <Header title="Courses" />
      <div className="p-2 5">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={formik.handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Course</DialogTitle>
                <DialogDescription>Add a new course here</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="institution">Institution Name</Label>
                <InstitutionDropdown
                  onInstitutionSelect={handleInstitutionSelect}
                />
              </div>
              <div className="grid gap-4 py-4">
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
                {formik.touched.name && formik.errors.name && (
                  <div>{formik.errors.name}</div>
                )}
              </div>
              <div className="grid gap-4 py-4">
                <Label htmlFor="description">Course Description</Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values.description}
                />
                {formik.touched.description && formik.errors.description && (
                  <div>{formik.errors.description}</div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <CoursesTable />
      </div>
    </Layout>
  );
};

export default Index;
