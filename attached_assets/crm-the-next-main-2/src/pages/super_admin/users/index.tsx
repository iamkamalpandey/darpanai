import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import api from "@/services/api";
import UsersTable from "@/components/shared/Tables/UsersTable";
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
import { MultiSelect } from "react-multi-select-component";
import { toast } from "sonner";

const UserFormSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  roleId: Yup.number().required("Role is required"),
  branches: Yup.array().of(Yup.number()).required("Branches are required"),
});

const Index = () => {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoleName, setSelectedRoleName] = useState("Select Role");

  const fetchData = () => {
    api.get("user/get-all").then((response) => {
      setData(response.data.data);
    });
    api.get("role").then((response) => {
      setRoles(response.data.data);
    });
    api.get("branch").then((response) => {
      setBranches(response.data.data);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      roleId: 0,
      branches: [],
    },
    validationSchema: UserFormSchema,
    onSubmit: (values, { resetForm }) => {
      api
        .post("auth/register", values)
        .then(() => {
          toast.success("User registered successfully");
          resetForm({});
          setIsDialogOpen(false); // Close the dialog
          fetchData(); // Refetch the data
        })
        .catch((error) => {
          console.error("Registration error", error);
        });
    },
  });

  return (
    <Layout>
      <Header title="User Management" />
      <div className="p-2.5">
        <div className="flex w-full my-2.5 items-center justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={formik.handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add User</DialogTitle>
                  <DialogDescription>Add a new user here</DialogDescription>
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

                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div>{formik.errors.email}</div>
                  )}

                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <div>{formik.errors.password}</div>
                  )}

                  <Label htmlFor="roleId">Role</Label>
                  <select
                    name="roleId"
                    className="border rounded p-2.5"
                    onChange={formik.handleChange}
                    value={formik.values.roleId}
                    style={{ display: "block" }}
                  >
                    <option value="" label={selectedRoleName} />
                    {roles.map((role: any) => (
                      <option key={role.id} value={role.id} label={role.name} />
                    ))}
                  </select>
                  {formik.touched.roleId && formik.errors.roleId && (
                    <div>{formik.errors.roleId}</div>
                  )}

                  <Label htmlFor="branches">Branches</Label>
                  <MultiSelect
                    labelledBy="Branches"
                    options={branches.map((branch: any) => ({
                      label: branch.name,
                      value: branch.id,
                    }))}
                    value={formik.values.branches.map((branchId: any) => ({
                      //@ts-ignore
                      label: branches.find((b: any) => b.id === branchId)?.name,
                      value: branchId,
                    }))}
                    onChange={(values: any) => {
                      formik.setFieldValue(
                        "branches",
                        values.map((value: any) => value.value)
                      );
                    }}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <UsersTable
          people={data}
          roles={roles}
          branches={branches}
          fetchData={fetchData}
        />
      </div>
    </Layout>
  );
};

export default Index;
