import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import api from "@/services/api";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import BranchTable from "@/components/shared/Tables/branch/BranchTable";

const BranchFormSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  latitude: Yup.number().required("Latitude is required"),
  longitude: Yup.number().required("Longitude is required"),
});

const Index = () => {
  const [data, setData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = () => {
    api.get("branch").then((response) => {
      setData(response.data.data);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      latitude: 0,
      longitude: 0,
    },
    validationSchema: BranchFormSchema,
    onSubmit: (values, { resetForm }) => {
      api
        .post("branch", values)
        .then(() => {
          toast.success("Branch created successfully");
          resetForm({});
          setIsDialogOpen(false); // Close the dialog
          fetchData(); // Refetch the data
        })
        .catch((error) => {
          console.error("Creation error", error);
        });
    },
  });

  return (
    <Layout>
      <Header title="Branch Management" />
      <div className="p-2.5">
        <div className="flex w-full my-2.5 items-center justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={formik.handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add Branch</DialogTitle>
                  <DialogDescription>Add a new branch here</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="name">Name</Label>
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

                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    onChange={formik.handleChange}
                    value={formik.values.latitude}
                  />
                  {formik.touched.latitude && formik.errors.latitude && (
                    <div>{formik.errors.latitude}</div>
                  )}

                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    onChange={formik.handleChange}
                    value={formik.values.longitude}
                  />
                  {formik.touched.longitude && formik.errors.longitude && (
                    <div>{formik.errors.longitude}</div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <BranchTable branches={data} fetchData={fetchData} />
      </div>
    </Layout>
  );
};

export default Index;
