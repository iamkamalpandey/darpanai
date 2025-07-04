//@ts-nocheck
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import { EditIcon, SlidersHorizontalIcon } from "lucide-react";
import { MultiSelect } from "react-multi-select-component";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { toast } from "sonner";

const UserEditSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  roleId: Yup.number().required("Role is required"),
  branches: Yup.array().of(Yup.number()).required("Branches are required"),
});

export default function UsersTable({
  people = [],
  roles,
  branches,
  fetchData,
}: {
  people?: any;
  roles: any;
  branches: any;
  identifier: any;
  fetchData: any;
}) {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const uniqueRoles = Array.from(
    new Set(people.map((person: any) => person?.role?.name))
  ).filter(Boolean);

  const filteredPeople = selectedRole
    ? people.filter((person: any) => person?.role?.name === selectedRole)
    : people;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      roleId: 0,
      userId: "",
      branches: [],
    },
    validationSchema: UserEditSchema,
    onSubmit: (values, { resetForm }) => {
      // Prepare the data for the API call
      const updateData = {
        ...values,
        branchIds: values.branches, // Rename branches to branchIds
      };
      delete updateData.branches; // Remove the original branches field

      // Update user API call
      api
        .patch(`auth/user/${editingUser.id}`, updateData)
        .then(() => {
          toast.success("User updated successfully");
          resetForm();
          setIsDialogOpen(false);
          fetchData();
        })
        .catch((error) => {
          console.error("Update error", error);
          toast.error("Failed to update user");
        });
    },
  });

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsDialogOpen(true);
    formik.setValues({
      userId: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      branches: user.UserBranch.map((ub: any) => ub.branchId), // Use branchId instead of id
      password: "", // Reset password field
    });
  };
  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <div className="flex gap-2.5">
          <Input placeholder="Search by Name" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="min-w-[100px]" variant="outline">
                <SlidersHorizontalIcon className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Roles</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setSelectedRole("")}
                  className={`${
                    selectedRole === "" ? "bg-muted" : ""
                  } cursor-pointer`}
                >
                  All Users
                </DropdownMenuItem>
                {uniqueRoles.map((role: any) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`${
                      selectedRole === role ? "bg-muted" : ""
                    } cursor-pointer`}
                  >
                    {role}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className=" ">
          <div className=" flex flex-col gap-2.5">
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
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Role
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
                      {filteredPeople.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-4 text-sm text-gray-500"
                          >
                            No Users available
                          </td>
                        </tr>
                      ) : (
                        filteredPeople.map((person: any) => (
                          <tr key={person.email}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {person.name}
                            </td>

                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {person.email}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {person?.role?.name}
                            </td>
                            <td className=" px-3 py-4 text-sm text-gray-500">
                              <Button
                                variant="outline"
                                className="mr-2"
                                onClick={() => handleEdit(person)}
                              >
                                <EditIcon className="mr-2 h-4 w-4" />
                                Edit
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
      </div>

      {editingUser && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={formik.handleSubmit}>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Edit user details here</DialogDescription>
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

                <Label htmlFor="roleId">Role</Label>
                <select
                  name="roleId"
                  className="border rounded p-2.5"
                  onChange={formik.handleChange}
                  value={formik.values.roleId}
                  style={{ display: "block" }}
                >
                  <option value="" label={selectedRole} />
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
                  value={formik.values.branches.map((branchId: number) => ({
                    label: branches.find((b: any) => b.id === branchId)?.name,
                    value: branchId,
                  }))}
                  onChange={(selectedOptions: any) => {
                    formik.setFieldValue(
                      "branches",
                      selectedOptions.map((option: any) => option.value)
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
      )}
    </div>
  );
}
